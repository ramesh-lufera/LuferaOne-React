<?php

namespace App\Services;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class SignInCredentials
{
    public const EMAIL_LOGO_PATH = 'mail/signup-logo';

    private const MAIL_FIELDS = [
        'emailUsername' => ['MAIL_USERNAME', 'mail.mailers.smtp.username'],
        'gmailAppPassword' => ['MAIL_PASSWORD', 'mail.mailers.smtp.password'],
        'emailSenderName' => ['MAIL_FROM_NAME', 'mail.from.name'],
    ];

    public function values(): array
    {
        $disk = Storage::disk('local');
        $logo = $disk->exists(self::EMAIL_LOGO_PATH) ? $disk->get(self::EMAIL_LOGO_PATH) : null;
        $logoMime = $logo ? (getimagesizefromstring($logo)['mime'] ?? null) : null;

        return [
            'googleClientId' => (string) config('services.google.client_id', ''),
            'googleClientSecret' => (string) config('services.google.client_secret', ''),
            'facebookAppId' => (string) config('services.facebook.app_id', ''),
            'facebookAppSecret' => (string) config('services.facebook.app_secret', ''),
            'emailUsername' => (string) config('mail.mailers.smtp.username', ''),
            'gmailAppPassword' => (string) config('mail.mailers.smtp.password', ''),
            'emailSenderName' => (string) config('mail.from.name', ''),
            'hasEmailLogo' => $logoMime !== null,
            'emailLogoPreview' => $logoMime ? 'data:'.$logoMime.';base64,'.base64_encode($logo) : null,
        ];
    }

    public function save(array $values): void
    {
        Cache::store('file')->lock('sign-in-credentials', 30)->block(10, function () use ($values): void {
            $path = app()->environmentFilePath();
            $contents = file_get_contents($path);
            if ($contents === false) {
                throw new RuntimeException('Unable to read mail configuration.');
            }
            $newline = str_contains($contents, "\r\n") ? "\r\n" : "\n";
            $updatedFields = array_intersect_key(self::MAIL_FIELDS, $values);
            foreach ($updatedFields as $field => [$environmentKey]) {
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
                throw new RuntimeException('Unable to prepare mail configuration.');
            }
            try {
                if (file_put_contents($temporary, $contents) !== strlen($contents)) {
                    throw new RuntimeException('Unable to write mail configuration.');
                }
                chmod($temporary, fileperms($path) & 0777);
                if (! rename($temporary, $path)) {
                    throw new RuntimeException('Unable to save mail configuration.');
                }
                Artisan::call('config:clear');
                foreach ($updatedFields as $field => [, $configKey]) {
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
