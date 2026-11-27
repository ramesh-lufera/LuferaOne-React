<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveProductRequest;
use App\Services\ProductPageSlug;
use Illuminate\Database\Query\Builder;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ProductController extends Controller
{
    public function categories(): JsonResponse
    {
        return response()->json(['categories' => DB::table('categories')->where('type', 'product')->select('id', 'name')->orderBy('name')->get()]);
    }

    public function taxes(): JsonResponse
    {
        $taxes = DB::table('taxes')->select('id', 'name', 'rate', 'type')
            ->orderBy('name')->get()
            ->map(fn (object $tax): array => [...(array) $tax, 'rate' => number_format((float) $tax->rate, 2, '.', '')]);

        return response()->json(['taxes' => $taxes]);
    }

    public function index(Request $request): JsonResponse
    {
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', Rule::in([10, 20, 50])],
        ]);
        $products = DB::table('products')->join('categories', 'categories.id', '=', 'products.category_id')
            ->select('products.id', 'products.name', 'products.title', 'products.duration_value', 'products.duration_unit', 'products.price', 'products.preview_price', 'products.page_slug', 'categories.name as category_name')
            ->when($data['search'] ?? '', function (Builder $query, string $search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query->whereLike('products.name', '%'.$search.'%')->orWhereLike('products.tags', '%'.$search.'%')->orWhereLike('categories.name', '%'.$search.'%');
                });
            })->orderByDesc('products.id')->paginate($data['per_page'] ?? 10)
            ->through(fn (object $record): array => [...(array) $record, 'page_path' => '/products/'.$record->page_slug]);

        return response()->json($products);
    }

    public function store(SaveProductRequest $request, ProductPageSlug $slugs): JsonResponse
    {
        return $this->save($request, $slugs);
    }

    public function update(SaveProductRequest $request, ProductPageSlug $slugs, string $product): JsonResponse
    {
        $record = DB::table('products')->lockForUpdate()->find($product);
        abort_unless($record, 404);

        return $this->save($request, $slugs, $record);
    }

    public function destroy(Request $request, string $product): JsonResponse
    {
        $record = DB::table('products')->lockForUpdate()->find($product);
        abort_unless($record, 404);
        $paths = [$record->product_image_path, $record->breadcrumb_image_path,
            ...json_decode($record->gallery_image_paths ?? '[]', true, flags: JSON_THROW_ON_ERROR)];
        DB::table('products')->where('id', $record->id)->delete();
        $request->attributes->set('activity_entity_id', $record->id);
        DB::afterCommit(fn () => Storage::disk('local')->delete($paths));

        return response()->json(['message' => 'Product deleted successfully.']);
    }

    private function save(SaveProductRequest $request, ProductPageSlug $slugs, ?object $record = null): JsonResponse
    {
        $data = $request->validated();
        $fields = array_intersect_key($data, array_flip(['category_id', 'category', 'module', 'name', 'title', 'subtitle', 'description', 'short_description', 'price', 'preview_price', 'duration_value', 'duration_unit', 'tags']));
        $fields['tax_id'] = array_key_exists('tax_id', $data) ? $data['tax_id'] : $record?->tax_id;
        if ($fields['tax_id'] !== null && ! DB::table('taxes')->where('id', $fields['tax_id'])->lockForUpdate()->first()) {
            throw ValidationException::withMessages(['tax_id' => 'This tax is no longer available. Reload the form and choose another tax.']);
        }
        $fields['gst'] = $fields['tax_id'] !== null || array_key_exists('tax_id', $data) ? null : ($data['gst'] ?? null);
        $obsoletePaths = [];
        foreach (['product_image', 'breadcrumb_image'] as $image) {
            if (! $request->hasFile($image)) {
                continue;
            }
            $path = $this->storeImage($request->file($image));
            $fields[$image.'_path'] = $path;
            if ($record) {
                $obsoletePaths[] = $record->{$image.'_path'};
            }
        }
        $galleryPaths = json_decode($record?->gallery_image_paths ?? '[]', true, flags: JSON_THROW_ON_ERROR);
        foreach ($data['remove_gallery_images'] ?? [] as $index) {
            if (isset($galleryPaths[$index])) {
                $obsoletePaths[] = $galleryPaths[$index];
                unset($galleryPaths[$index]);
            }
        }
        foreach ($request->file('gallery_images', []) as $index => $file) {
            if (! $file) {
                continue;
            }
            if (isset($galleryPaths[$index])) {
                $obsoletePaths[] = $galleryPaths[$index];
            }
            $galleryPaths[$index] = $this->storeImage($file);
        }
        ksort($galleryPaths);
        $fields['gallery_image_paths'] = json_encode(array_values($galleryPaths), JSON_THROW_ON_ERROR);
        foreach (['inclusions', 'exclusions'] as $key) {
            $fields[$key] = json_encode($data[$key], JSON_THROW_ON_ERROR);
        }
        $fields['is_featured'] = $request->boolean('is_featured');
        $fields['requires_login'] = $request->boolean('requires_login');
        $fields['page_slug'] = $record?->page_slug ?? $slugs->available($data['name']);
        $fields['updated_at'] = now();
        try {
            if ($record) {
                $id = $record->id;
                DB::table('products')->where('id', $id)->update($fields);
            } else {
                $id = DB::table('products')->insertGetId($fields + ['created_at' => $fields['updated_at']]);
            }
        } catch (UniqueConstraintViolationException $exception) {
            throw ValidationException::withMessages(['name' => 'Another product just used this page name. Please save again.']);
        }
        if ($obsoletePaths) {
            DB::afterCommit(fn () => Storage::disk('local')->delete(array_values(array_unique($obsoletePaths))));
        }
        $request->attributes->set('activity_entity_id', $id);

        return response()->json(['id' => $id, 'page_path' => '/products/'.$fields['page_slug'], 'message' => $record ? 'Product updated successfully.' : 'Product saved successfully.'], $record ? 200 : 201);
    }

    private function storeImage(UploadedFile $image): string
    {
        $path = $image->store('products', 'local');
        if ($path === false) {
            throw new RuntimeException('The product image could not be stored.');
        }
        DB::afterRollBack(fn () => Storage::disk('local')->delete($path));

        return $path;
    }

    public function show(Request $request, string $product): JsonResponse
    {
        return $this->details($request, $product, false);
    }

    public function external(Request $request, string $product): JsonResponse
    {
        return $this->details($request, $product, true);
    }

    private function details(Request $request, string $slug, bool $external): JsonResponse
    {
        $record = DB::table('products')->join('categories', 'categories.id', '=', 'products.category_id')
            ->select('products.*', 'categories.name as category_name')->where('products.page_slug', $slug)->first();
        abort_unless($record, 404);
        $data = (array) $record;
        foreach (['inclusions', 'exclusions'] as $key) {
            $data[$key] = json_decode($data[$key], true, flags: JSON_THROW_ON_ERROR);
        }
        $tax = $record->tax_id ? DB::table('taxes')->select('id', 'name', 'rate', 'type')->find($record->tax_id) : null;
        $data['tax'] = $tax ? [...(array) $tax, 'rate' => number_format((float) $tax->rate, 2, '.', '')] : null;
        $data['durations'] = [['value' => $record->duration_value, 'unit' => $record->duration_unit, 'price' => $record->price, 'preview_price' => $record->preview_price]];
        if ($tax) {
            $data['durations'] = array_map(fn (array $duration): array => $this->taxedPrice($duration, $tax), $data['durations']);
        }
        $data['pricing_locked'] = $external && $record->requires_login && ! $request->user('sanctum');
        if ($data['pricing_locked']) {
            $data['durations'] = [];
            $data['price'] = null;
            $data['preview_price'] = null;
        }
        foreach (['product_image', 'breadcrumb_image'] as $image) {
            unset($data[$image.'_path']);
            $data[$image.'_url'] = URL::temporarySignedRoute('products.image', now()->addMinutes(15), ['product' => $slug, 'image' => $image, 'v' => sha1($record->{$image.'_path'})]);
        }
        $galleryPaths = json_decode($record->gallery_image_paths ?? '[]', true, flags: JSON_THROW_ON_ERROR);
        unset($data['gallery_image_paths']);
        $data['gallery_image_urls'] = array_map(
            fn (int $index): string => URL::temporarySignedRoute('products.image', now()->addMinutes(15), ['product' => $slug, 'image' => 'gallery_'.$index, 'v' => sha1($galleryPaths[$index])]),
            array_keys(array_slice($galleryPaths, 0, 3)),
        );
        $data['page_path'] = '/products/'.$slug;

        return response()->json(['product' => $data])->header('Cache-Control', 'private, no-store');
    }

    private function taxedPrice(array $duration, object $tax): array
    {
        $amountCents = (int) round((float) $duration['price'] * 100);
        $rateBasisPoints = (int) round((float) $tax->rate * 100);
        $inclusive = $tax->type === 'inclusive';
        $taxCents = (int) round($amountCents * $rateBasisPoints / ($inclusive ? 10000 + $rateBasisPoints : 10000));
        $baseCents = $inclusive ? $amountCents - $taxCents : $amountCents;
        $totalCents = $inclusive ? $amountCents : $amountCents + $taxCents;

        return [...$duration,
            'base_amount' => number_format($baseCents / 100, 2, '.', ''),
            'tax_amount' => number_format($taxCents / 100, 2, '.', ''),
            'total_amount' => number_format($totalCents / 100, 2, '.', ''),
        ];
    }

    public function image(string $product, string $image): BinaryFileResponse
    {
        $record = DB::table('products')->where('page_slug', $product)->first();
        abort_unless($record, 404);
        if (preg_match('/^gallery_([0-3])$/', $image, $matches)) {
            $paths = json_decode($record->gallery_image_paths ?? '[]', true, flags: JSON_THROW_ON_ERROR);
            $path = $paths[(int) $matches[1]] ?? null;
        } else {
            abort_unless(in_array($image, ['product_image', 'breadcrumb_image'], true), 404);
            $path = $record->{$image.'_path'};
        }
        $disk = Storage::disk('local');
        abort_unless($path && $disk->exists($path), 404);

        return response()->file($disk->path($path), ['X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'private, max-age=300']);
    }
}
