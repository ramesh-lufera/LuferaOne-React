<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class FacebookIdentityVerifier
{
    /** @return array<string, mixed> */
    public function verify(string $accessToken): array
    {
        $appId = config('services.facebook.app_id');
        $secret = config('services.facebook.app_secret');
        abort_unless(is_string($appId) && $appId !== '' && is_string($secret) && $secret !== '', 503, 'Facebook sign-in has not been configured.');
        $version = config('services.facebook.graph_version', 'v27.0');
        $baseUrl = 'https://graph.facebook.com/'.$version;
        $http = Http::withOptions(['verify' => config('services.facebook.ca_bundle') ?: true])->acceptJson()->timeout(15);

        try {
            $debugResponse = $http->withToken($appId.'|'.$secret)->get($baseUrl.'/debug_token', ['input_token' => $accessToken]);
        } catch (ConnectionException $exception) {
            abort(503, 'Facebook sign-in is temporarily unavailable. Please try again.');
        }
        if ($debugResponse->serverError()) {
            abort(503, 'Facebook sign-in is temporarily unavailable. Please try again.');
        }
        $debug = $debugResponse->json('data');
        if (! $debugResponse->successful() || ! is_array($debug)
            || ($debug['is_valid'] ?? false) !== true
            || (string) ($debug['app_id'] ?? '') !== $appId
            || ($debug['type'] ?? '') !== 'USER'
            || ! preg_match('/^[0-9]{1,255}$/', (string) ($debug['user_id'] ?? ''))
            || ! is_numeric($debug['expires_at'] ?? null) || $debug['expires_at'] <= time()
            || (isset($debug['data_access_expires_at']) && $debug['data_access_expires_at'] != 0 && $debug['data_access_expires_at'] <= time())) {
            throw ValidationException::withMessages(['facebook' => ['Facebook could not verify this sign-in. Please try again.']]);
        }

        try {
            $profileResponse = $http->withToken($accessToken)->get($baseUrl.'/me', [
                'fields' => 'id,name,email,picture.type(large)',
                'appsecret_proof' => hash_hmac('sha256', $accessToken, $secret),
            ]);
        } catch (ConnectionException $exception) {
            abort(503, 'Facebook sign-in is temporarily unavailable. Please try again.');
        }
        if ($profileResponse->serverError()) {
            abort(503, 'Facebook sign-in is temporarily unavailable. Please try again.');
        }
        $profile = $profileResponse->json();
        if (! $profileResponse->successful() || ! is_array($profile)
            || (string) ($profile['id'] ?? '') !== (string) $debug['user_id']) {
            throw ValidationException::withMessages(['facebook' => ['Facebook could not verify this profile. Please try again.']]);
        }

        return $profile;
    }
}
