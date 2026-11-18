<?php

namespace App\Services;

class UserIdentifier
{
    public function generate(): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $letters = '';
        for ($index = 0; $index < 3; $index++) {
            $letters .= $alphabet[random_int(0, 25)];
        }

        return $letters.str_pad((string) random_int(0, 999), 3, '0', STR_PAD_LEFT);
    }
}
