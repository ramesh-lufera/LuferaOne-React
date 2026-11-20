<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SaveCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'featured_image' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:5120'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'url' => ['nullable', 'string', 'max:2048'],
            'type' => ['required', 'in:package,product'],
            'inclusions' => ['sometimes', 'array', 'list', 'max:50'],
            'inclusions.*' => ['nullable', 'string', 'max:255'],
            'exclusions' => ['sometimes', 'array', 'list', 'max:50'],
            'exclusions.*' => ['nullable', 'string', 'max:255'],
            'requires_login' => ['required', 'boolean'],
        ];
    }
}
