<?php

namespace Database\Factories;

use App\Models\Sheet;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SheetAttachmentFactory extends Factory
{
    public function definition(): array
    {
        return ['sheet_id' => Sheet::factory(), 'row_id' => fake()->uuid(), 'user_id' => User::factory(), 'name' => 'document.pdf', 'path' => 'sheet-attachments/'.fake()->uuid().'.pdf', 'mime_type' => 'application/pdf', 'size' => 1024];
    }
}
