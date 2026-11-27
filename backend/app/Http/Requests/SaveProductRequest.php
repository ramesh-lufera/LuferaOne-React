<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')->where('type', 'product')],
            'category' => ['sometimes', 'required', 'string', 'max:255'],
            'module' => ['sometimes', 'required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:10000'],
            'short_description' => ['required', 'string', 'max:2000'],
            'product_image' => [$this->isMethod('PUT') ? 'nullable' : 'required', 'image', 'mimes:jpeg,png,webp', 'max:5120'],
            'breadcrumb_image' => [$this->isMethod('PUT') ? 'nullable' : 'required', 'image', 'mimes:jpeg,png,webp', 'max:5120'],
            'gallery_images' => ['sometimes', 'array:0,1,2', 'max:3'],
            'remove_gallery_images' => ['sometimes', 'array', 'list', 'max:4'],
            'remove_gallery_images.*' => ['required', 'integer', 'distinct', Rule::in([0, 1, 2, 3])],
            'gallery_images.*' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:5120'],
            'price' => ['required', 'numeric', 'min:0', 'max:99999999.99', 'decimal:0,2'],
            'preview_price' => ['required', 'numeric', 'min:0', 'max:99999999.99', 'decimal:0,2', 'gte:price'],
            'duration_value' => ['required', 'integer', 'min:1', 'max:10000'],
            'duration_unit' => ['required', Rule::in(['day', 'week', 'month', 'year'])],
            'tags' => ['required', 'string', 'max:2000'],
            'is_featured' => ['required', 'boolean'],
            'inclusions' => ['required', 'array', 'list', 'min:1', 'max:50'],
            'inclusions.*' => ['required', 'string', 'max:255'],
            'exclusions' => ['required', 'array', 'list', 'min:1', 'max:50'],
            'exclusions.*' => ['required', 'string', 'max:255'],
            'tax_id' => ['sometimes', 'nullable', 'integer', 'exists:taxes,id'],
            'gst' => ['nullable', 'integer', Rule::in([0, 5, 12, 18, 28])],
            'requires_login' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_image.uploaded' => 'Product Image failed to upload. Use a JPEG, PNG or WebP image no larger than 5 MB and try again.',
            'breadcrumb_image.uploaded' => 'Breadcrumb Image failed to upload. Use a JPEG, PNG or WebP image no larger than 5 MB and try again.',
            'gallery_images.*.uploaded' => ':attribute failed to upload. Use a JPEG, PNG or WebP image no larger than 5 MB and try again.',
            'product_image.max' => 'Product Image must be no larger than 5 MB.',
            'breadcrumb_image.max' => 'Breadcrumb Image must be no larger than 5 MB.',
            'gallery_images.*.max' => ':attribute must be no larger than 5 MB.',
        ];
    }

    public function attributes(): array
    {
        return [
            'gallery_images.0' => 'Gallery Image 1',
            'gallery_images.1' => 'Gallery Image 2',
            'gallery_images.2' => 'Gallery Image 3',
        ];
    }
}
