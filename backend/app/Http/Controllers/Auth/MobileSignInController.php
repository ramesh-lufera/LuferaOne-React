<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Laravel\Sanctum\PersonalAccessToken;

class MobileSignInController extends Controller
{
    public function start(Request $request): JsonResponse
    {
        $data = $request->validate([
            'provider' => ['required', 'in:google,facebook'],
            'remember' => ['required', 'boolean'],
            'mode' => ['sometimes', 'in:signin,signup'],
            'terms' => ['required_if:mode,signup', 'boolean'],
        ]);
        $provider = $data['provider'];
        $mode = $data['mode'] ?? 'signin';
        $origin = config('cors.mobile_web_origin');
        abort_unless(is_string($origin) && in_array($origin, config('cors.allowed_origins'), true)
            && in_array(parse_url($origin, PHP_URL_SCHEME), ['https', 'http'], true)
            && parse_url($origin, PHP_URL_HOST), 503, 'Mobile sign-in is not configured.');
        abort_unless($provider === 'google'
            ? config('services.google.client_id') && config('services.google.client_secret')
            : config('services.facebook.app_id') && config('services.facebook.app_secret'),
            503, ucfirst($provider).' sign-in is not configured.');

        $state = bin2hex(random_bytes(32));
        $verifier = bin2hex(random_bytes(32));
        $expiresAt = now()->addMinutes(5);
        abort_unless(Cache::put($this->key($state), [
            'provider' => $provider,
            'mode' => $mode,
            'verifier_hash' => hash('sha256', $verifier),
            'expires_at' => $expiresAt->getTimestamp(),
        ], $expiresAt), 503, 'Unable to start mobile sign-in. Please try again.');

        $query = http_build_query([
            'state' => $state,
            'provider' => $provider,
            'remember' => (int) $data['remember'],
            ...($mode === 'signup' ? ['mode' => $mode, 'terms' => (int) $data['terms']] : []),
        ]);

        return $this->privateJson([
            'url' => $origin.'/mobile-sign-in#'.$query,
            'state' => $state,
            'verifier' => $verifier,
        ]);
    }

    public function authorize(Request $request): JsonResponse
    {
        abort_unless($request->header('Origin') === config('cors.mobile_web_origin')
            && $request->header('X-Requested-With') === 'XMLHttpRequest', 403, 'Invalid mobile sign-in origin.');
        $data = $request->validate(['state' => ['required', 'regex:/\A[a-f0-9]{64}\z/']]);
        $key = $this->key($data['state']);

        return Cache::lock($key.':lock', 10)->block(5, function () use ($request, $key): JsonResponse {
            $attempt = Cache::get($key);
            abort_if(! $attempt || isset($attempt['code_hash']), 410, 'This mobile sign-in has expired. Please try again.');

            $token = $request->user()->currentAccessToken();
            abort_unless($token instanceof PersonalAccessToken && $request->bearerToken()
                && $token->name === $attempt['provider'].(($attempt['mode'] ?? 'signin') === 'signup' ? '-sign-up' : '-sign-in')
                && $token->created_at->getTimestamp() >= $attempt['expires_at'] - 300,
                403, 'Invalid mobile sign-in session.');

            $code = bin2hex(random_bytes(32));
            $attempt['code_hash'] = hash('sha256', $code);
            $attempt['token'] = Crypt::encryptString($request->bearerToken());
            abort_unless(Cache::put($key, $attempt, $attempt['expires_at'] - now()->getTimestamp()),
                503, 'Unable to finish mobile sign-in. Please try again.');

            return $this->privateJson(['code' => $code]);
        });
    }

    public function exchange(Request $request): JsonResponse
    {
        $hex = ['required', 'regex:/\A[a-f0-9]{64}\z/'];
        $data = $request->validate(['state' => $hex, 'code' => $hex, 'verifier' => $hex]);
        $key = $this->key($data['state']);

        return Cache::lock($key.':lock', 10)->block(5, function () use ($data, $key): JsonResponse {
            $attempt = Cache::get($key);
            abort_unless(isset($attempt['code_hash'])
                && hash_equals($attempt['verifier_hash'], hash('sha256', $data['verifier']))
                && hash_equals($attempt['code_hash'], hash('sha256', $data['code'])),
                422, 'This mobile sign-in is invalid or has expired. Please try again.');

            $token = Crypt::decryptString($attempt['token']);
            abort_unless(Cache::forget($key), 503, 'Unable to finish mobile sign-in. Please try again.');

            return $this->privateJson(['token' => $token]);
        });
    }

    private function key(string $state): string
    {
        return 'mobile-sign-in:'.hash('sha256', $state);
    }

    private function privateJson(array $data): JsonResponse
    {
        return response()->json($data)->header('Cache-Control', 'no-store');
    }
}
