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
        Schema::table('taxes', function (Blueprint $table): void {
            $table->dropUnique(['default_region']);
            $table->dropColumn(['region', 'is_default', 'default_region']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('taxes', function (Blueprint $table): void {
            $table->string('region', 120)->default('');
            $table->boolean('is_default')->default(false);
            $table->string('default_region', 120)->nullable()->unique();
        });
    }
};
