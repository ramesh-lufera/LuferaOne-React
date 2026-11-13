<?php

namespace App\Services;

use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class GoogleIdentityVerifier
{
    /** @return array<string, mixed> */
    public function verify(string $credential, ?string $nonce): array
    {
        $clientId = config('services.google.client_id');
        abort_unless(is_string($clientId) && $clientId !== '', 503, 'Google sign-in has not been configured.');

        try {
            $keys = Cache::store('file')->remember('google-identity-public-keys', 3600, function (): array {
                return Http::withOptions(['verify' => config('services.google.ca_bundle') ?: true])->timeout(10)->get('https://www.googleapis.com/oauth2/v3/certs')->throw()->json();
            });
            $claims = (array) JWT::decode($credential, JWK::parseKeySet($keys, 'RS256'));
        } catch (ConnectionException|RequestException $exception) {
            abort(503, 'Google sign-in is temporarily unavailable. Please try again.');
        } catch (\Exception $exception) {
            Log::warning('Google identity signature verification failed', ['reason' => $exception->getMessage(), 'exception' => $exception::class]);
            throw ValidationException::withMessages(['credential' => ['Google could not verify this sign-in. Please try again.']]);
        }

        if (! in_array($claims['iss'] ?? '', ['accounts.google.com', 'https://accounts.google.com'], true)
            || ($claims['aud'] ?? null) !== $clientId
            || (isset($claims['azp']) && $claims['azp'] !== $clientId)
            || ! is_numeric($claims['exp'] ?? null) || $claims['exp'] <= time()
            || ! is_string($claims['sub'] ?? null) || $claims['sub'] === '' || strlen($claims['sub']) > 255
            || ($nonce !== null && (! is_string($claims['nonce'] ?? null) || ! hash_equals($nonce, $claims['nonce'])))
            || ($claims['email_verified'] ?? false) !== true
            || ! filter_var($claims['email'] ?? '', FILTER_VALIDATE_EMAIL)
            || strlen($claims['email']) > 255) {
            Log::warning('Google identity claims rejected', [
                'issuer_valid' => in_array($claims['iss'] ?? '', ['accounts.google.com', 'https://accounts.google.com'], true),
                'audience_valid' => ($claims['aud'] ?? null) === $clientId,
                'authorized_party_valid' => ! isset($claims['azp']) || $claims['azp'] === $clientId,
                'subject_type' => get_debug_type($claims['sub'] ?? null),
                'email_verified_type' => get_debug_type($claims['email_verified'] ?? null),
                'email_verified' => $claims['email_verified'] ?? false,
                'nonce_required' => $nonce !== null,
            ]);
            throw ValidationException::withMessages(['credential' => ['Google could not verify this sign-in. Please try again.']]);
        }

        return $claims;
    }
}
