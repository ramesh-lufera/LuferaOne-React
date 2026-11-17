<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class UpdateUserRequest extends StoreUserRequest
{
    public function rules(): array
    {
        $rules = parent::rules();
        $rules['email'] = ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore((int) $this->route('user'))];
        $rules['username'] = ['nullable', 'string', 'min:3', 'max:50', 'regex:/^[a-z0-9_.-]+$/', Rule::unique('users', 'username')->ignore((int) $this->route('user'))];
        $rules['password'][0] = 'nullable';
        $rules['remove_profile_image'] = ['sometimes', 'boolean'];

        return $rules;
    }
}
