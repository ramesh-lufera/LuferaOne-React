<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $normalized = [];
        foreach (['full_name', 'email', 'phone_country_code', 'phone_number', 'website', 'country', 'city', 'state', 'zip_code', 'address', 'gstin'] as $field) {
            if (is_string($this->input($field))) {
                $normalized[$field] = trim($this->input($field));
            }
        }
        if (isset($normalized['email'])) {
            $normalized['email'] = mb_strtolower($normalized['email']);
        }
        if (isset($normalized['gstin'])) {
            $normalized['gstin'] = strtoupper($normalized['gstin']);
        }
        if (! empty($normalized['website']) && ! preg_match('~^[a-z][a-z0-9+.-]*://~i', $normalized['website'])) {
            $normalized['website'] = 'https://'.$normalized['website'];
        }
        $this->merge($normalized);
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'], 'email' => ['required', 'email', 'max:255'],
            'phone_country_code' => ['required', 'regex:/^\+[1-9][0-9]{0,3}$/'],
            'phone_number' => ['required', 'string', 'max:30', 'regex:/^(?=(?:\D*\d){7,15}\D*$)[0-9 ()-]{7,30}$/'],
            'website' => ['nullable', 'url:http,https', 'max:2048'],
            'country' => ['required', 'string', 'max:100'], 'city' => ['required', 'string', 'max:100'], 'state' => ['required', 'string', 'max:100'],
            'zip_code' => ['required', 'string', 'max:20', 'regex:/^[a-zA-Z0-9 -]+$/'],
            'address' => ['required', 'string', 'max:2000'], 'gstin' => ['required', 'regex:/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'sign_in_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'sign_up_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_logo' => ['sometimes', 'boolean'], 'remove_sign_in_image' => ['sometimes', 'boolean'], 'remove_sign_up_image' => ['sometimes', 'boolean'],
        ];
    }
}
