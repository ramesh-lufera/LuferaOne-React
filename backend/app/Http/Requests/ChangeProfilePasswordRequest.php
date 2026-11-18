<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChangeProfilePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string', 'max:128'],
            'password' => [...(new StoreUserRequest)->rules()['password'], 'confirmed'],
            'password_confirmation' => ['required', 'string', 'max:128'],
        ];
    }
}
