<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class RegisterController extends Controller
{
    public function __invoke(RegisterRequest $request): JsonResponse
    {
        $data = $request->safe()->only(['name', 'email', 'phone', 'username', 'password']);
        $data['terms_accepted_at'] = now();

        try {
            $user = User::create($data);
        } catch (UniqueConstraintViolationException $exception) {
            $errors = [];
            foreach (['email', 'username'] as $field) {
                if (User::where($field, $data[$field])->exists()) {
                    $errors[$field] = ["The {$field} has already been taken."];
                }
            }
            if ($errors === []) {
                throw $exception;
            }
            throw ValidationException::withMessages($errors);
        }

        return response()->json([
            'message' => 'Account created successfully. Please sign in.',
            'user' => $user->only(['id', 'name', 'email', 'phone', 'username']),
        ], 201);
    }
}
