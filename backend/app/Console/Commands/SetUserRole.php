<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SetUserRole extends Command
{
    protected $signature = 'users:set-role {email} {role}';

    protected $description = 'Assign user, auditor, admin, or super_admin from a trusted server console';

    public function handle(ActivityLogger $logger): int
    {
        if (! in_array($this->argument('role'), ['user', 'auditor', 'admin', 'super_admin'], true)) {
            $this->error('Invalid role.');

            return self::FAILURE;
        }
        $user = User::where('email', $this->argument('email'))->first();
        if (! $user) {
            $this->error('User not found.');

            return self::FAILURE;
        }
        DB::transaction(function () use ($user, $logger) {
            DB::table('roles')->orderBy('id')->lockForUpdate()->get();
            $user->refresh();
            if ($user->role === 'super_admin' && $this->argument('role') !== 'super_admin' && User::where('role', 'super_admin')->count() <= 1) {
                throw new \RuntimeException('Keep at least one Super Admin.');
            }
            $previous = $user->role;
            $user->role = $this->argument('role');
            $user->save();
            $logger->record(null, 'Update', 'Roles', (string) $user->id, ['source' => 'console', 'previous_role' => $previous, 'role' => $user->role]);
        });
        $this->info('Role updated.');

        return self::SUCCESS;
    }
}
