<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MarketplaceController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'sliders' => $this->sliders(),
            'banners' => DB::table('marketplace_banners')->orderByDesc('id')->get()->map(fn (object $record): array => $this->banner($record)),
            'categories' => DB::table('categories')->select('id', 'name', 'type')->orderBy('name')->get(),
        ]);
    }

    private function sliders(): Collection
    {
        return DB::table('marketplace_sliders')->join('categories', 'categories.id', '=', 'marketplace_sliders.category_id')
            ->select('marketplace_sliders.*', 'categories.name as category_name', 'categories.type', 'categories.page_slug')
            ->orderBy('position')->orderBy('marketplace_sliders.id')->get();
    }

    public function storeSlider(Request $request): JsonResponse
    {
        return $this->saveSlider($request);
    }

    public function updateSlider(Request $request, int $slider): JsonResponse
    {
        return $this->saveSlider($request, $slider);
    }

    private function saveSlider(Request $request, ?int $slider = null): JsonResponse
    {
        $data = $request->validate([
            'category_id' => ['required', 'integer', 'exists:categories,id', Rule::unique('marketplace_sliders')->ignore($slider)],
            'slider' => ['nullable', 'integer', 'between:1,3'],
        ]);
        $id = DB::transaction(function () use ($data, $slider): int {
            $fields = [...$data, 'updated_at' => now()];
            if ($slider !== null) {
                abort_unless(DB::table('marketplace_sliders')->lockForUpdate()->find($slider), 404);
                DB::table('marketplace_sliders')->where('id', $slider)->update($fields);

                return $slider;
            }

            return DB::table('marketplace_sliders')->insertGetId([...$fields, 'position' => (DB::table('marketplace_sliders')->max('position') ?? 0) + 1, 'created_at' => now()]);
        });

        return response()->json(['id' => $id, 'message' => 'Marketplace category saved.'], $slider === null ? 201 : 200);
    }

    public function destroySlider(int $slider): JsonResponse
    {
        abort_unless(DB::table('marketplace_sliders')->where('id', $slider)->delete(), 404);

        return response()->json(['message' => 'Marketplace category removed.']);
    }

    public function reorder(Request $request): JsonResponse
    {
        $data = $request->validate(['ids' => ['required', 'array', 'list'], 'ids.*' => ['required', 'integer', 'distinct']]);
        DB::transaction(function () use ($data): void {
            $current = DB::table('marketplace_sliders')->lockForUpdate()->pluck('id')->all();
            $ids = array_map('intval', $data['ids']);
            sort($current);
            $sorted = $ids;
            sort($sorted);
            if ($sorted !== $current) {
                throw ValidationException::withMessages(['ids' => 'The marketplace list changed. Reload it before reordering.']);
            }
            foreach ($ids as $position => $id) {
                DB::table('marketplace_sliders')->where('id', $id)->update(['position' => $position + 1, 'updated_at' => now()]);
            }
        });

        return response()->json(['message' => 'Marketplace order updated.']);
    }

    public function storeBanner(Request $request): JsonResponse
    {
        return $this->saveBanner($request);
    }

    public function updateBanner(Request $request, int $banner): JsonResponse
    {
        return $this->saveBanner($request, $banner);
    }

    private function saveBanner(Request $request, ?int $banner = null): JsonResponse
    {
        $data = $request->validate([
            'slides' => ['required', 'array', 'list', 'size:3'],
            'slides.*' => ['required', 'array:title,description,button_text,button_link,image'],
            'slides.*.title' => ['required', 'string', 'max:255'],
            'slides.*.description' => ['nullable', 'string', 'max:5000'],
            'slides.*.button_text' => ['required', 'string', 'max:120'],
            'slides.*.button_link' => ['required', 'string', 'max:2000', 'regex:~^(https?://[^\s]+|/(?!/)[^\s]*|\#[^\s]*)$~i'],
            'slides.*.image' => [$banner === null ? 'required' : 'nullable', 'image', 'mimes:jpeg,png,webp', 'max:5120'],
        ]);
        $id = DB::transaction(function () use ($data, $banner): int {
            $record = $banner === null ? null : DB::table('marketplace_banners')->lockForUpdate()->find($banner);
            abort_if($banner !== null && ! $record, 404);
            $old = $record ? json_decode($record->slides, true, flags: JSON_THROW_ON_ERROR) : [];
            $slides = [];
            foreach ($data['slides'] as $index => $slide) {
                $image = $slide['image'] ?? null;
                unset($slide['image']);
                $path = $old[$index]['image_path'] ?? null;
                if ($image) {
                    $previous = $path;
                    $path = $image->store('marketplace', 'local');
                    DB::afterRollBack(fn () => Storage::disk('local')->delete($path));
                    if ($previous) {
                        DB::afterCommit(fn () => Storage::disk('local')->delete($previous));
                    }
                }
                $slides[] = [...$slide, 'image_path' => $path];
            }
            $fields = ['slides' => json_encode($slides, JSON_THROW_ON_ERROR), 'updated_at' => now()];
            if ($record) {
                DB::table('marketplace_banners')->where('id', $banner)->update($fields);

                return $banner;
            }

            return DB::table('marketplace_banners')->insertGetId([...$fields, 'created_at' => now()]);
        });

        return response()->json(['id' => $id, 'message' => 'Marketplace banner saved.'], $banner === null ? 201 : 200);
    }

    private function banner(object $record): array
    {
        $slides = json_decode($record->slides, true, flags: JSON_THROW_ON_ERROR);
        foreach ($slides as $index => &$slide) {
            $slide['image_url'] = URL::temporarySignedRoute('marketplace.image', now()->addMinutes(30), ['banner' => $record->id, 'slide' => $index, 'v' => sha1($slide['image_path'] ?? '')]);
            unset($slide['image_path']);
        }

        return ['id' => $record->id, 'slides' => $slides];
    }

    public function destroyBanner(int $banner): JsonResponse
    {
        DB::transaction(function () use ($banner): void {
            $record = DB::table('marketplace_banners')->lockForUpdate()->find($banner);
            abort_unless($record, 404);
            $paths = array_column(json_decode($record->slides, true, flags: JSON_THROW_ON_ERROR), 'image_path');
            DB::table('marketplace_banners')->where('id', $banner)->delete();
            DB::afterCommit(fn () => Storage::disk('local')->delete($paths));
        });

        return response()->json(['message' => 'Marketplace banner removed.']);
    }

    public function image(int $banner, int $slide): BinaryFileResponse
    {
        $record = DB::table('marketplace_banners')->find($banner);
        abort_unless($record, 404);
        $slides = json_decode($record->slides, true, flags: JSON_THROW_ON_ERROR);
        $path = $slides[$slide]['image_path'] ?? null;
        abort_unless($path && Storage::disk('local')->exists($path), 404);

        return response()->file(Storage::disk('local')->path($path), ['Cache-Control' => 'private, max-age=300', 'X-Content-Type-Options' => 'nosniff']);
    }

    public function publicIndex(Request $request): JsonResponse
    {
        $authenticated = (bool) $request->user('sanctum');
        $sliders = $this->sliders();
        $categories = DB::table('categories')->whereIn('id', $sliders->pluck('category_id'))->get()->keyBy('id');
        $catalog = collect();
        foreach (['product' => 'products', 'package' => 'packages'] as $type => $table) {
            $records = DB::table($table)->whereIn('category_id', $sliders->where('type', $type)->pluck('category_id'))->orderByDesc('created_at')->get();
            foreach ($records as $record) {
                $category = $categories->get($record->category_id);
                if (! $authenticated && $category->requires_login) {
                    continue;
                }
                $locked = ! $authenticated && $record->requires_login;
                $card = [
                    'id' => $record->id, 'category_id' => $record->category_id, 'type' => $type,
                    'name' => $record->name, 'title' => $record->title, 'subtitle' => $record->subtitle,
                    'short_description' => $record->short_description, 'tags' => $record->tags ?? '',
                    'pricing_locked' => $locked,
                    'inclusions' => json_decode($record->inclusions, true, flags: JSON_THROW_ON_ERROR),
                    'page_path' => '/external/'.$table.'/'.$record->page_slug,
                    'image_url' => URL::temporarySignedRoute($table.'.image', now()->addMinutes(15), [$type => $record->page_slug, 'image' => $type.'_image']),
                    'banner_url' => URL::temporarySignedRoute($table.'.image', now()->addMinutes(15), [$type => $record->page_slug, 'image' => 'breadcrumb_image']),
                ];
                if ($type === 'product') {
                    $card['price'] = $locked ? null : number_format((float) $record->price, 2, '.', '');
                    $card['preview_price'] = $locked ? null : number_format((float) $record->preview_price, 2, '.', '');
                } else {
                    $card['durations'] = $locked ? [] : array_map(fn (array $duration): array => [...$duration, 'duration' => $duration['value'].' '.$duration['unit']], json_decode($record->durations, true, flags: JSON_THROW_ON_ERROR));
                }
                $catalog->push($card);
            }
        }

        return response()->json([
            'sliders' => $sliders->map(function (object $item) use ($categories, $catalog, $authenticated): array {
                $category = $categories->get($item->category_id);
                $locked = ! $authenticated && $category->requires_login;

                return [
                    'id' => $item->id, 'category_name' => $item->category_name, 'type' => $item->type,
                    'slider' => $item->slider, 'page_path' => '/external/categories/'.$item->page_slug,
                    'requires_login' => (bool) $category->requires_login,
                    'description' => $locked ? null : $category->description,
                    'image_url' => ! $locked && $category->featured_image_path ? URL::temporarySignedRoute('categories.image', now()->addMinutes(15), ['category' => $item->page_slug]) : null,
                    'items' => $catalog->where('category_id', $item->category_id)->values(),
                ];
            }),
            'banners' => DB::table('marketplace_banners')->orderByDesc('id')->get()->map(fn (object $record): array => $this->banner($record)),
        ])->header('Cache-Control', 'private, no-store');
    }
}
