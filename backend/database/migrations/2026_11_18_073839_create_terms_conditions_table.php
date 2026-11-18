<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('terms_conditions', function (Blueprint $table) {
            $table->unsignedTinyInteger('id')->primary();
            $table->longText('content');
            $table->timestamps();
        });
        DB::table('terms_conditions')->insert(['id' => 1, 'content' => '', 'created_at' => now(), 'updated_at' => now()]);
    }

    public function down(): void
    {
        Schema::dropIfExists('terms_conditions');
    }
};
