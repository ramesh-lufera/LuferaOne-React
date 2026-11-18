<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('theme_color_settings', function (Blueprint $table) {
            $table->id();
            $table->string('palette_id', 100);
            $table->char('color', 7);
            $table->char('focus', 7);
            $table->char('text', 7);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('theme_color_settings');
    }
};
