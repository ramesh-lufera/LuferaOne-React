<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductPageSlug
{
    public function available(string $name): string
    {
        $stem = substr(Str::slug($name), 0, 180) ?: 'product';
        if (in_array($stem, ['new', 'categories'], true)) {
            $stem = 'product-'.$stem;
        }
        $slug = $stem;
        for ($suffix = 2; DB::table('products')->where('page_slug', $slug)->exists(); $suffix++) {
            $slug = $stem.'-'.$suffix;
        }

        return $slug;
    }
}
