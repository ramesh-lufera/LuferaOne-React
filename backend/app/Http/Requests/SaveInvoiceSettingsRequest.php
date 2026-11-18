<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveInvoiceSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'prefix' => ['present', 'nullable', 'string', 'max:30', 'regex:/^[\pL\pN._\/ -]*$/u'],
            'series' => ['required', 'string', 'regex:/^(?=.*[1-9])[0-9]{1,12}$/'],
            'suffix' => ['present', 'nullable', 'string', 'max:30', 'regex:/^[\pL\pN._\/ -]*$/u'],
            'version' => ['required', 'integer', 'min:0'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_logo' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return ['series.regex' => 'Series must contain 1 to 12 digits and start from at least 1. Leading zeros are preserved.'];
    }
}
