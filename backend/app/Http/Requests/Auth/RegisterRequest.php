<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $normalized = [];
        foreach (['name', 'email', 'phone', 'username'] as $field) {
            if (is_string($this->input($field))) {
                $value = trim($this->input($field));
                $normalized[$field] = in_array($field, ['email', 'username'], true) ? mb_strtolower($value) : $value;
            }
        }
        $this->merge($normalized);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')],
            'phone' => ['bail', 'required', 'string', 'max:30', 'regex:/^\+?[0-9 ()-]{7,30}$/', function (string $attribute, mixed $value, \Closure $fail): void {
                $digits = preg_replace('/\D/', '', $value);
                if (strlen($digits) < 7 || strlen($digits) > 15) {
                    $fail('The phone number must contain between 7 and 15 digits.');
                }
            }],
            'username' => ['required', 'string', 'min:3', 'max:50', 'regex:/^[a-z0-9_.-]+$/', Rule::unique('users', 'username')],
            'password' => ['required', 'string', 'max:128', Password::min(8)],
            'terms' => ['required', 'accepted'],
        ];
    }
}
