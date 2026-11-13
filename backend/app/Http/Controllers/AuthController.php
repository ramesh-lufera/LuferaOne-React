<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['sometimes', 'boolean'],
        ]);

        $email = mb_strtolower(trim($data['email']));
        $user = User::where('email', $email)->first();
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            $request->attributes->set('activity_failed_email', $email);

            return response()->json(['message' => 'Invalid email or password.'], 401);
        }

        $expiresAt = ! empty($data['remember']) ? now()->addDays(30) : now()->addHours(8);
        $token = $user->createToken('sign-in', ['*'], $expiresAt)->plainTextToken;

        $request->attributes->set('activity_actor', $user);
        $request->attributes->set('activity_entity_id', $user->id);

        return response()->json(['token' => $token, 'user' => $user]);
    }

    public function user(Request $request)
    {
        return response()->json(['user' => $request->user()]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Signed out.']);
    }
}
