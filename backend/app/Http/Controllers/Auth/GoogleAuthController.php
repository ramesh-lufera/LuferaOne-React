<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\GoogleIdentityVerifier;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class GoogleAuthController extends Controller
{
    public function nonce(): JsonResponse
    {
        $nonce = bin2hex(random_bytes(32));
        Cache::store('file')->put('google-login-nonce:'.hash('sha256', $nonce), true, now()->addMinutes(5));

        return response()->json(['nonce' => $nonce])->header('Cache-Control', 'no-store');
    }

    public function code(Request $request, GoogleIdentityVerifier $verifier): JsonResponse
    {
        $origin = $request->header('Origin');
        abort_unless(in_array($origin, config('cors.allowed_origins', []), true)
            && $request->header('X-Requested-With') === 'XMLHttpRequest', 403, 'Invalid Google sign-in origin.');
        $request->validate([
            'code' => ['required', 'string', 'max:10000'],
            'nonce' => ['required', 'string', 'size:64'],
            'mode' => ['required', 'in:signin,signup'],
            'remember' => ['sometimes', 'boolean'],
            'terms' => ['sometimes', 'boolean'],
        ]);
        abort_unless(config('services.google.client_secret'), 503, 'Google sign-in is not configured.');
        try {
            $response = Http::withOptions(['verify' => config('services.google.ca_bundle') ?: true])
                ->asForm()->timeout(15)->post('https://oauth2.googleapis.com/token', [
                    'code' => $request->input('code'),
                    'client_id' => config('services.google.client_id'),
                    'client_secret' => config('services.google.client_secret'),
                    'redirect_uri' => $origin,
                    'grant_type' => 'authorization_code',
                ]);
        } catch (ConnectionException $exception) {
            abort(503, 'Google sign-in is temporarily unavailable. Please try again.');
        }
        if (! $response->successful() || ! is_string($response->json('id_token'))) {
            throw ValidationException::withMessages(['credential' => ['Google could not complete this sign-in. Please try again.']]);
        }
        $request->merge(['credential' => $response->json('id_token')]);

        return $this->authenticate($request, $verifier, true);
    }

    public function __invoke(Request $request, GoogleIdentityVerifier $verifier): JsonResponse
    {
        return $this->authenticate($request, $verifier);
    }

    private function authenticate(Request $request, GoogleIdentityVerifier $verifier, bool $codeExchanged = false): JsonResponse
    {
        $data = $request->validate([
            'credential' => ['required', 'string', 'max:10000'],
            'nonce' => ['required', 'string', 'size:64'],
            'mode' => ['required', 'in:signin,signup'],
            'remember' => ['sometimes', 'boolean'],
            'terms' => ['sometimes', 'boolean'],
        ]);
        $claims = $verifier->verify($data['credential'], $codeExchanged ? null : $data['nonce']);
        $nonceKey = 'google-login-nonce:'.hash('sha256', $data['nonce']);
        $validNonce = Cache::store('file')->lock($nonceKey.':lock', 10)->block(5, function () use ($nonceKey): bool {
            return Cache::store('file')->pull($nonceKey, false) === true;
        });
        if (! $validNonce) {
            throw ValidationException::withMessages(['credential' => ['This Google sign-in has expired. Please try again.']]);
        }

        $user = DB::transaction(function () use ($claims, $data): User {
            $user = User::where('google_id', $claims['sub'])->lockForUpdate()->first();
            $email = strtolower($claims['email']);
            if (! $user) {
                $user = User::where('email', $email)->lockForUpdate()->first();
            }
            if ($user && $user->google_id !== $claims['sub']) {
                $authoritative = str_ends_with($email, '@gmail.com') || ! empty($claims['hd']);
                if ($user->google_id || ! $authoritative) {
                    throw ValidationException::withMessages(['credential' => ['Please sign in to this account with your password.']]);
                }
            }
            if (! $user) {
                $user = new User;
                $user->name = mb_substr($claims['name'] ?? Str::before($email, '@'), 0, 255);
                $user->email = $email;
                $user->password = Str::random(64);
                $user->terms_accepted_at = ! empty($data['terms']) ? now() : null;
            }
            if (blank($user->name)) {
                $user->name = mb_substr($claims['name'] ?? Str::before($email, '@'), 0, 255);
            }
            $picture = $claims['picture'] ?? null;
            if (is_string($picture) && strlen($picture) <= 2048
                && filter_var($picture, FILTER_VALIDATE_URL)
                && parse_url($picture, PHP_URL_SCHEME) === 'https') {
                $user->google_photo_url = $picture;
            }
            $user->google_id = $claims['sub'];
            $user->email_verified_at ??= now();
            if ($user->isDirty()) {
                $user->save();
            }

            return $user;
        });

        $expiresAt = ! empty($data['remember']) ? now()->addDays(30) : now()->addHours(8);
        $token = $user->createToken('google-sign-in', ['*'], $expiresAt)->plainTextToken;

        return response()->json(['token' => $token, 'user' => $user->only(['id', 'name', 'email', 'google_photo_url'])])->header('Cache-Control', 'no-store');
    }
}
