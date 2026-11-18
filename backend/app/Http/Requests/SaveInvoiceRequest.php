<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'request_id' => [$this->route('invoice') ? 'prohibited' : 'required', 'uuid'],
            'invoice_number' => ['prohibited'],
            'total_cents' => ['prohibited'],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'customer_address' => ['nullable', 'string', 'max:2000'],
            'customer_phone' => ['nullable', 'string', 'max:30'],
            'issued_on' => ['required', 'date_format:Y-m-d'],
            'due_on' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:issued_on'],
            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*' => ['required', 'array:description,quantity,unit,unit_price'],
            'items.*.description' => ['required', 'string', 'max:500'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:10000'],
            'items.*.unit' => ['nullable', 'string', 'max:30'],
            'items.*.unit_price' => ['required', 'regex:/^[0-9]{1,7}(\.[0-9]{1,2})?$/'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
