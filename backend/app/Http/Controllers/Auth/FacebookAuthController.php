<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\FacebookIdentityVerifier;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class FacebookAuthController extends Controller
{
    public function __invoke(Request $request, FacebookIdentityVerifier $verifier): JsonResponse
    {
        abort_unless(in_array($request->header('Origin'), config('cors.allowed_origins', []), true)
            && $request->header('X-Requested-With') === 'XMLHttpRequest', 403, 'Invalid Facebook sign-in origin.');
        $data = $request->validate([
            'access_token' => ['required', 'string', 'max:10000'],
            'mode' => ['required', 'in:signin,signup'],
            'remember' => ['sometimes', 'boolean'],
            'terms' => ['sometimes', 'boolean'],
        ]);
        $profile = $verifier->verify($data['access_token']);

        try {
            $user = DB::transaction(function () use ($profile, $data): User {
                $facebookId = (string) $profile['id'];
                $email = is_string($profile['email'] ?? null) ? strtolower(trim($profile['email'])) : null;
                $validEmail = $email !== null && strlen($email) <= 255 && filter_var($email, FILTER_VALIDATE_EMAIL);
                $user = User::where('facebook_id', $facebookId)->lockForUpdate()->first();
                if (! $user && $validEmail) {
                    $user = User::where('email', $email)->lockForUpdate()->first();
                }
                if ($user && $user->facebook_id && $user->facebook_id !== $facebookId) {
                    throw ValidationException::withMessages(['facebook' => ['This email is already linked to another Facebook account. Please sign in with your password.']]);
                }
                if (! $user) {
                    if (! $validEmail) {
                        throw ValidationException::withMessages(['facebook' => ['Facebook did not share an email address. Please allow email access or sign up with your email.']]);
                    }
                    $user = new User;
                    $user->email = $email;
                    $user->password = Str::random(64);
                    $user->terms_accepted_at = ! empty($data['terms']) ? now() : null;
                }
                if (blank($user->name)) {
                    $name = is_string($profile['name'] ?? null) && trim($profile['name']) !== '' ? $profile['name'] : Str::before($user->email, '@');
                    $user->name = mb_substr($name, 0, 255);
                }
                $photo = data_get($profile, 'picture.data.url');
                if (is_string($photo) && strlen($photo) <= 2048
                    && filter_var($photo, FILTER_VALIDATE_URL)
                    && parse_url($photo, PHP_URL_SCHEME) === 'https') {
                    $user->facebook_photo_url = $photo;
                }
                $user->facebook_id = $facebookId;
                if ($validEmail && strcasecmp($user->email, $email) === 0) {
                    $user->email_verified_at ??= now();
                }
                if ($user->isDirty()) {
                    $user->save();
                }

                return $user;
            });
        } catch (UniqueConstraintViolationException $exception) {
            return response()->json(['message' => 'Your account changed during sign-in. Please try again.'], 409);
        }

        $expiresAt = ! empty($data['remember']) ? now()->addDays(30) : now()->addHours(8);
        $token = $user->createToken('facebook-sign-in', ['*'], $expiresAt)->plainTextToken;

        return response()->json(['token' => $token, 'user' => $user->only(['id', 'name', 'email', 'facebook_photo_url'])])->header('Cache-Control', 'no-store');
    }
}
