<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class RoleAccess
{
    /** @return list<string> */
    public function modules(User $user): array
    {
        $role = DB::table('roles')->where('name', $user->role ?? 'user')->where('active', true)->first();

        return $role ? json_decode($role->modules, true) : [];
    }

    public function allows(User $user, string $module): bool
    {
        $modules = $this->modules($user);

        return in_array('*', $modules, true) || in_array($module, $modules, true);
    }

    /** @return list<string> */
    public function selectedCategoryIds(User $user): array
    {
        $ids = [];
        foreach ($this->modules($user) as $module) {
            if (preg_match('/^category:([1-9][0-9]*)$/D', $module, $matches)) {
                $ids[] = $matches[1];
            }
        }

        return $ids;
    }
}
