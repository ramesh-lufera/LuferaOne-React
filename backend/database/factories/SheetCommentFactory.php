<?php

namespace Database\Factories;

use App\Models\Sheet;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SheetCommentFactory extends Factory
{
    public function definition(): array
    {
        return ['sheet_id' => Sheet::factory(), 'row_id' => fake()->uuid(), 'user_id' => User::factory(), 'body' => fake()->sentence()];
    }
}
