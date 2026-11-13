<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SetUserRole extends Command
{
    protected $signature = 'users:set-role {email} {role}';

    protected $description = 'Assign user, auditor, or admin from a trusted server console';

    public function handle(ActivityLogger $logger): int
    {
        if (! in_array($this->argument('role'), ['user', 'auditor', 'admin'], true)) {
            $this->error('Invalid role.');

            return self::FAILURE;
        }
        $user = User::where('email', $this->argument('email'))->first();
        if (! $user) {
            $this->error('User not found.');

            return self::FAILURE;
        }
        DB::transaction(function () use ($user, $logger) {
            $previous = $user->role;
            $user->role = $this->argument('role');
            $user->save();
            $logger->record(null, 'Update', 'Roles', (string) $user->id, ['source' => 'console', 'previous_role' => $previous, 'role' => $user->role]);
        });
        $this->info('Role updated.');

        return self::SUCCESS;
    }
}
