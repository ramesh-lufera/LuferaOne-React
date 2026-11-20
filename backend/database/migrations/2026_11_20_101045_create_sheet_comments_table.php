<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sheet_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sheet_id')->constrained()->cascadeOnDelete();
            $table->string('row_id', 100);
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('sheet_comments')->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();
            $table->index(['sheet_id', 'row_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sheet_comments');
    }
};
