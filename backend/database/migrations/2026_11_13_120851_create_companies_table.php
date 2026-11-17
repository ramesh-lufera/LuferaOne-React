<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('profile_key')->default('shared')->unique();
            $table->string('full_name');
            $table->string('email');
            $table->string('phone_country_code', 5);
            $table->string('phone_number', 30);
            $table->string('website', 2048)->nullable();
            $table->string('country', 100);
            $table->string('city', 100);
            $table->string('state', 100);
            $table->string('zip_code', 20);
            $table->text('address');
            $table->string('gstin', 15);
            $table->string('logo_path')->nullable();
            $table->string('sign_in_image_path')->nullable();
            $table->string('sign_up_image_path')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
