<?php

use App\Services\UserIdentifier;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('user_code', 6)->nullable()->unique();
        });
        $generator = new UserIdentifier;
        DB::table('users')->orderBy('id')->chunkById(200, function ($users) use ($generator): void {
            foreach ($users as $user) {
                for ($attempt = 0; $attempt < 100; $attempt++) {
                    try {
                        DB::table('users')->where('id', $user->id)->whereNull('user_code')->update(['user_code' => $generator->generate()]);
                        break;
                    } catch (UniqueConstraintViolationException $exception) {
                        if ($attempt === 99) {
                            throw $exception;
                        }
                    }
                }
            }
        });
        Schema::table('users', function (Blueprint $table) {
            $table->string('user_code', 6)->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['user_code']);
            $table->dropColumn('user_code');
        });
    }
};
