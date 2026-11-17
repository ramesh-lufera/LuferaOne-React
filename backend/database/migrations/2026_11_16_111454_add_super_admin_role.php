<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('roles')->insert([
            'name' => 'super_admin',
            'description' => 'Super Admin with full application access and control of Super Admin assignments.',
            'active' => true,
            'modules' => json_encode(['*']),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::transaction(function (): void {
            DB::table('users')->where('role', 'super_admin')->update(['role' => 'admin']);
            DB::table('roles')->where('name', 'super_admin')->delete();
        });
    }
};
