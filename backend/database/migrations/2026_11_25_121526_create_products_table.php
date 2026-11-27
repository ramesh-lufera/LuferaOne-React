<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('page_slug')->unique();
            $table->string('title');
            $table->string('subtitle');
            $table->text('description');
            $table->text('short_description');
            $table->string('product_image_path');
            $table->string('breadcrumb_image_path');
            $table->decimal('price', 10, 2);
            $table->decimal('preview_price', 10, 2);
            $table->unsignedInteger('duration_value');
            $table->string('duration_unit', 8);
            $table->text('tags');
            $table->boolean('is_featured')->default(false);
            $table->json('gallery_image_paths')->nullable();
            $table->foreignId('tax_id')->nullable()->constrained('taxes')->restrictOnDelete();
            $table->json('inclusions');
            $table->json('exclusions');
            $table->unsignedTinyInteger('gst')->nullable();
            $table->boolean('requires_login')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
