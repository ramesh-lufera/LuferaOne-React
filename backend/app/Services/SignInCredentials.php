<?php

namespace App\Services;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use RuntimeException;

class SignInCredentials
{
    public const FIELDS = [
        'googleClientId' => ['GOOGLE_CLIENT_ID', 'services.google.client_id'],
        'googleClientSecret' => ['GOOGLE_CLIENT_SECRET', 'services.google.client_secret'],
        'facebookAppId' => ['FACEBOOK_APP_ID', 'services.facebook.app_id'],
        'facebookAppSecret' => ['FACEBOOK_APP_SECRET', 'services.facebook.app_secret'],
    ];

    public function values(): array
    {
        $values = [];
        foreach (self::FIELDS as $field => [$environmentKey, $configKey]) {
            $values[$field] = (string) config($configKey, '');
        }

        return $values;
    }

    public function save(array $values): void
    {
        Cache::store('file')->lock('sign-in-credentials', 30)->block(10, function () use ($values): void {
            $path = app()->environmentFilePath();
            $contents = file_get_contents($path);
            if ($contents === false) {
                throw new RuntimeException('Unable to read sign-in configuration.');
            }
            $newline = str_contains($contents, "\r\n") ? "\r\n" : "\n";
            foreach (self::FIELDS as $field => [$environmentKey, $configKey]) {
                $escaped = str_replace(['\\', '"', '$'], ['\\\\', '\\"', '\\$'], $values[$field]);
                $entry = $environmentKey.'="'.$escaped.'"';
                $pattern = '/^'.preg_quote($environmentKey, '/').'=[^\r\n]*/m';
                if (preg_match($pattern, $contents)) {
                    $contents = preg_replace_callback($pattern, fn (): string => $entry, $contents);
                } else {
                    $contents = rtrim($contents, "\r\n").$newline.$entry.$newline;
                }
            }
            $temporary = tempnam(dirname($path), '.credentials-');
            if ($temporary === false) {
                throw new RuntimeException('Unable to prepare sign-in configuration.');
            }
            try {
                if (file_put_contents($temporary, $contents) !== strlen($contents)) {
                    throw new RuntimeException('Unable to write sign-in configuration.');
                }
                chmod($temporary, fileperms($path) & 0777);
                if (! rename($temporary, $path)) {
                    throw new RuntimeException('Unable to save sign-in configuration.');
                }
                Artisan::call('config:clear');
                foreach (self::FIELDS as $field => [$environmentKey, $configKey]) {
                    config([$configKey => $values[$field]]);
                }
            } finally {
                if (is_file($temporary)) {
                    unlink($temporary);
                }
            }
        });
    }
}
