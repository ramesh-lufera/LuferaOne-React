<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('activity_logs')) {
            return;
        }
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('event_id')->unique();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('username')->nullable();
            $table->string('user_name');
            $table->string('action', 30)->index();
            $table->string('module', 100)->index();
            $table->string('entity_id')->nullable();
            $table->text('description');
            $table->json('metadata')->nullable();
            $table->timestamp('occurred_at')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
