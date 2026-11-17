<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $normalized = [];
        foreach (['name', 'email', 'username', 'phone', 'business_name', 'gstin', 'date_of_birth', 'address', 'city', 'state', 'country', 'pincode'] as $field) {
            if (is_string($this->input($field))) {
                $value = trim($this->input($field));
                $normalized[$field] = $value === '' ? null : $value;
            }
        }
        foreach (['email', 'username'] as $field) {
            if (isset($normalized[$field])) {
                $normalized[$field] = mb_strtolower($normalized[$field]);
            }
        }
        if (isset($normalized['gstin'])) {
            $normalized['gstin'] = strtoupper($normalized['gstin']);
        }
        $this->merge($normalized);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'username' => ['required', 'string', 'min:3', 'max:50', 'regex:/^[a-z0-9_.-]+$/', Rule::unique('users', 'username')],
            'password' => ['required', 'string', 'max:128', Password::min(12)->mixedCase()->numbers()->symbols(), 'regex:/[^\\p{L}\\p{N}\\s]/u'],
            'phone' => ['nullable', 'string', 'max:30', 'regex:/^\+?(?=(?:\D*\d){7,15}\D*$)[0-9 ()-]{7,30}$/'],
            'business_name' => ['nullable', 'string', 'max:255'],
            'gstin' => ['nullable', 'regex:/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/'],
            'date_of_birth' => ['nullable', 'date_format:Y-m-d', 'before_or_equal:today'],
            'address' => ['nullable', 'string', 'max:2000'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'pincode' => ['nullable', 'string', 'max:20', 'regex:/^[a-zA-Z0-9 -]+$/'],
            'profile_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'role' => ['prohibited'],
        ];
    }
}
