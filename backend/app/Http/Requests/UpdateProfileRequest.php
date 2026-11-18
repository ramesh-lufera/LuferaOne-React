<?php

namespace App\Http\Requests;

class UpdateProfileRequest extends UpdateUserRequest
{
    protected function targetUserId(): int
    {
        return (int) $this->user()->id;
    }

    public function rules(): array
    {
        return array_replace(parent::rules(), [
            'password' => ['prohibited'],
            'user_id' => ['prohibited'],
            'id' => ['prohibited'],
            'cover_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_cover_image' => ['sometimes', 'boolean'],
        ]);
    }
}
