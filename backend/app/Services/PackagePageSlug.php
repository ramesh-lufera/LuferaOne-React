<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PackagePageSlug
{
    public function available(string $name): string
    {
        $stem = substr(Str::slug($name), 0, 180) ?: 'package';
        if (in_array($stem, ['new', 'categories'], true)) {
            $stem = 'package-'.$stem;
        }
        $slug = $stem;
        for ($suffix = 2; DB::table('packages')->where('page_slug', $slug)->exists(); $suffix++) {
            $slug = $stem.'-'.$suffix;
        }

        return $slug;
    }
}
