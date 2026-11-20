<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategoryPageSlug
{
    public function available(?string $url, string $name, ?int $ignoreId = null): string
    {
        $path = parse_url($url ?? '', PHP_URL_PATH);
        $filename = rawurldecode(basename(rtrim((string) $path, '/')));
        $filename = trim((string) preg_replace('/[^a-z0-9._-]+/i', '-', $filename), '.-');
        $filename = substr($filename ?: Str::slug($name), 0, 180) ?: 'category';
        $extension = pathinfo($filename, PATHINFO_EXTENSION);
        $stem = $extension === '' ? $filename : substr($filename, 0, -strlen($extension) - 1);
        $extension = $extension === '' ? '' : '.'.$extension;

        $candidate = $filename;
        $categories = DB::table('categories')->when($ignoreId !== null, fn ($query) => $query->where('id', '<>', $ignoreId));
        for ($suffix = 2; (clone $categories)->whereRaw('LOWER(page_slug) = ?', [strtolower($candidate)])->exists(); $suffix++) {
            $candidate = $stem.'-'.$suffix.$extension;
        }

        return $candidate;
    }
}
