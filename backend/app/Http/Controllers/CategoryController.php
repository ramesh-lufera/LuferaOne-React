<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveCategoryRequest;
use App\Services\CategoryPageSlug;
use App\Services\RoleAccess;
use Illuminate\Database\Query\Builder;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', Rule::in([10, 20, 50])],
        ]);
        $search = $data['search'] ?? '';
        $categories = DB::table('categories')->select(['id', 'name', 'description', 'url', 'type', 'page_slug'])
            ->when($search !== '', function (Builder $query) use ($search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query->whereLike('name', '%'.$search.'%')
                        ->orWhereLike('description', '%'.$search.'%')
                        ->orWhereLike('url', '%'.$search.'%')
                        ->orWhereLike('type', '%'.$search.'%');
                });
            })
            ->orderByDesc('id')
            ->paginate($data['per_page'] ?? 10)
            ->through(fn (object $category): array => [...(array) $category, 'page_path' => $this->pagePath($category)]);

        return response()->json($categories);
    }

    public function sidebar(Request $request, RoleAccess $access): JsonResponse
    {
        $user = $request->user();
        $categories = DB::table('categories')
            ->when(! in_array($user->role, ['super_admin', 'admin'], true), fn (Builder $query) => $query->whereIn('id', $access->selectedCategoryIds($user)))
            ->orderByDesc('id')->get(['id', 'name', 'page_slug'])
            ->map(fn (object $category): array => ['id' => $category->id, 'name' => $category->name, 'page_path' => $this->pagePath($category)]);

        return response()->json(['categories' => $categories])->header('Cache-Control', 'private, no-store');
    }

    public function show(Request $request, RoleAccess $access, string $category): JsonResponse
    {
        $record = DB::table('categories')->where('page_slug', $category)->first();
        $user = $request->user();
        abort_unless($access->allows($user, 'categories') || ($record && $access->allows($user, 'category:'.$record->id)), 403, 'You do not have access to this category.');
        abort_unless($record, 404);
        $data = (array) $record;
        unset($data['featured_image_path']);

        return response()->json(['category' => [...$data, ...$this->details($record)]]);
    }

    public function external(Request $request, string $category): JsonResponse
    {
        $record = DB::table('categories')->where('page_slug', $category)->first();
        abort_unless($record, 404);
        abort_if($record->requires_login && ! $request->user('sanctum'), 401, 'Sign in to view this category.');

        return response()->json(['category' => $this->details($record)])->header('Cache-Control', 'private, no-store');
    }

    private function details(object $record): array
    {
        $data = array_intersect_key((array) $record, array_flip([
            'name', 'description', 'type',
        ]));
        $data['inclusions'] = json_decode($record->inclusions, true, flags: JSON_THROW_ON_ERROR);
        $data['exclusions'] = json_decode($record->exclusions, true, flags: JSON_THROW_ON_ERROR);
        $data['requires_login'] = (bool) $record->requires_login;
        $data['page_path'] = $this->pagePath($record);
        $data['featured_image_url'] = $record->featured_image_path
            ? URL::temporarySignedRoute('categories.image', now()->addMinutes(15), ['category' => $record->page_slug])
            : null;

        return $data;
    }

    public function image(string $category): BinaryFileResponse
    {
        $path = DB::table('categories')->where('page_slug', $category)->value('featured_image_path');
        $disk = Storage::disk('local');
        abort_unless($path && $disk->exists($path), 404);

        return response()->file($disk->path($path), ['X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'private, max-age=300']);
    }

    private function pagePath(object $category): string
    {
        return '/categories/'.$category->page_slug;
    }

    public function store(SaveCategoryRequest $request, CategoryPageSlug $slugs): JsonResponse
    {
        return $this->save($request, $slugs);
    }

    public function update(SaveCategoryRequest $request, CategoryPageSlug $slugs, string $category): JsonResponse
    {
        $record = DB::table('categories')->lockForUpdate()->find($category);
        abort_unless($record, 404);

        return $this->save($request, $slugs, $record);
    }

    public function destroy(Request $request, string $category): JsonResponse
    {
        $record = DB::table('categories')->lockForUpdate()->find($category);
        abort_unless($record, 404);
        if (DB::table('products')->where('category_id', $record->id)->exists()) {
            throw ValidationException::withMessages(['category' => 'This category has products and cannot be deleted.']);
        }
        if (DB::table('packages')->where('category_id', $record->id)->exists()) {
            throw ValidationException::withMessages(['category' => 'This category has packages and cannot be deleted.']);
        }
        DB::table('categories')->where('id', $record->id)->delete();
        $request->attributes->set('activity_entity_id', $record->id);

        if ($record->featured_image_path) {
            DB::afterCommit(function () use ($record): void {
                if (! DB::table('categories')->where('featured_image_path', $record->featured_image_path)->exists()) {
                    Storage::disk('local')->delete($record->featured_image_path);
                }
            });
        }

        return response()->json(['message' => 'Category deleted successfully.']);
    }

    private function save(SaveCategoryRequest $request, CategoryPageSlug $slugs, ?object $record = null): JsonResponse
    {
        $data = $request->validated();
        $previousImage = $record?->featured_image_path;
        $path = $previousImage;
        if ($request->hasFile('featured_image')) {
            $path = $request->file('featured_image')->store('categories', 'local');
            if ($path === false) {
                throw new RuntimeException('The category image could not be stored.');
            }
            DB::afterRollBack(fn () => Storage::disk('local')->delete($path));
            if ($previousImage) {
                DB::afterCommit(fn () => Storage::disk('local')->delete($previousImage));
            }
        }

        $url = $data['url'] ?? null;
        $fields = [
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'url' => $url,
            'page_slug' => $record && $record->url === $url
                ? $record->page_slug
                : $slugs->available($url, $data['name'], $record?->id),
            'type' => $data['type'],
            'featured_image_path' => $path,
            'inclusions' => json_encode(array_values(array_filter($data['inclusions'] ?? [], fn (?string $item): bool => $item !== null && $item !== '')), JSON_THROW_ON_ERROR),
            'exclusions' => json_encode(array_values(array_filter($data['exclusions'] ?? [], fn (?string $item): bool => $item !== null && $item !== '')), JSON_THROW_ON_ERROR),
            'requires_login' => $request->boolean('requires_login'),
            'updated_at' => now(),
        ];
        try {
            if ($record) {
                $id = $record->id;
                DB::table('categories')->where('id', $id)->update($fields);
            } else {
                $id = DB::table('categories')->insertGetId($fields + ['created_at' => $fields['updated_at']]);
            }
        } catch (UniqueConstraintViolationException $exception) {
            throw ValidationException::withMessages(['url' => 'Another category just used this page name. Save again to use the next available name.']);
        }
        request()->attributes->set('activity_entity_id', $id);

        return response()->json([
            'id' => $id,
            'message' => $record ? 'Category updated successfully.' : 'Category saved successfully.',
        ], $record ? 200 : 201);
    }
}
