<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 30)->unique();
            $table->text('description')->nullable();
            $table->boolean('active')->default(true);
            $table->json('modules');
            $table->timestamps();
        });
        foreach (['admin' => ['*'], 'user' => ['dashboard'], 'auditor' => ['dashboard', 'activity-log']] as $name => $modules) {
            DB::table('roles')->insert([
                'name' => $name, 'description' => ucfirst($name).' role', 'active' => true,
                'modules' => json_encode($modules), 'created_at' => now(), 'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
