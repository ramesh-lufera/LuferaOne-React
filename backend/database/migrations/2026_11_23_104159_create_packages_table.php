<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('module');
            $table->string('name');
            $table->string('page_slug')->unique();
            $table->string('title');
            $table->string('subtitle');
            $table->text('description');
            $table->text('short_description');
            $table->string('package_image_path');
            $table->string('breadcrumb_image_path');
            $table->json('durations');
            $table->json('inclusions');
            $table->json('exclusions');
            $table->json('addons');
            $table->unsignedTinyInteger('gst')->nullable();
            $table->boolean('requires_login')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
