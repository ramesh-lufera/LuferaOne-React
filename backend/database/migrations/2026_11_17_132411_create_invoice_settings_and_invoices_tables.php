<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoice_settings', function (Blueprint $table) {
            $table->unsignedTinyInteger('id')->primary();
            $table->string('prefix', 30)->default('INV-');
            $table->unsignedBigInteger('next_number')->default(1);
            $table->unsignedTinyInteger('series_width')->default(4);
            $table->string('suffix', 30)->default('');
            $table->string('logo_path')->nullable();
            $table->unsignedBigInteger('version')->default(0);
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
        });
        DB::table('invoice_settings')->insert([
            'id' => 1, 'prefix' => 'INV-', 'next_number' => 1, 'series_width' => 4, 'suffix' => '',
            'created_at' => now(), 'updated_at' => now(),
        ]);
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number', 100)->unique();
            $table->uuid('request_id')->unique();
            $table->string('request_hash', 64);
            $table->string('customer_name');
            $table->string('customer_email')->nullable();
            $table->text('customer_address')->nullable();
            $table->string('customer_phone', 30)->nullable();
            $table->date('issued_on');
            $table->date('due_on')->nullable();
            $table->json('items');
            $table->unsignedBigInteger('total_cents');
            $table->text('notes')->nullable();
            $table->string('logo_path')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('invoice_settings');
    }
};
