<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CompanyFactory extends Factory
{
    public function definition(): array
    {
        return ['profile_key' => 'shared', 'full_name' => fake()->company(), 'email' => fake()->companyEmail(), 'phone_country_code' => '+91',
            'phone_number' => '8680808204', 'country' => 'India', 'city' => 'Trichy', 'state' => 'Tamil Nadu', 'zip_code' => '620001', 'address' => fake()->address(), 'gstin' => '33AEZPA0582L1Z7'];
    }
}
