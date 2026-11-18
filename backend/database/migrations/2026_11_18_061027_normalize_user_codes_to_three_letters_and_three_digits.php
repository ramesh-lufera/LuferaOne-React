<?php

use App\Services\UserIdentifier;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $generator = new UserIdentifier;
        DB::table('users')->orderBy('id')->chunkById(200, function ($users) use ($generator): void {
            foreach ($users as $user) {
                if (preg_match('/^[A-Z]{3}[0-9]{3}$/', $user->user_code)) {
                    continue;
                }
                for ($attempt = 0; $attempt < 100; $attempt++) {
                    try {
                        DB::table('users')->where('id', $user->id)->where('user_code', $user->user_code)->update(['user_code' => $generator->generate()]);
                        break;
                    } catch (UniqueConstraintViolationException $exception) {
                        if ($attempt === 99) {
                            throw $exception;
                        }
                    }
                }
            }
        });
    }

    public function down(): void
    {
        // The previous format accepts these IDs; preserve the assigned identifiers.
    }
};
