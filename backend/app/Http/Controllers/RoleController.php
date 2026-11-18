<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\RoleAccess;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        $roles = DB::table('roles')->orderBy('id')->get()->map(function ($role) {
            $role->modules = json_decode($role->modules, true);
            $role->active = (bool) $role->active;
            $role->users_count = User::where('role', $role->name)->count();

            return $role;
        });

        return response()->json(['roles' => $roles, 'modules' => config('modules')]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $id = DB::table('roles')->insertGetId([...$data, 'modules' => json_encode($data['modules']), 'created_at' => now(), 'updated_at' => now()]);

        return response()->json(['id' => $id, 'message' => 'Role created.'], 201);
    }

    public function update(Request $request, int $role): JsonResponse
    {
        $data = $this->validated($request, $role);
        DB::transaction(function () use ($role, $data): void {
            $current = DB::table('roles')->where('id', $role)->lockForUpdate()->first();
            abort_unless($current, 404);
            abort_if(in_array($current->name, ['admin', 'super_admin'], true), 422, 'The administrator role is protected.');
            abort_if(in_array($current->name, ['user', 'auditor'], true) && $data['name'] !== $current->name, 422, 'Built-in role names cannot be changed.');
            DB::table('roles')->where('id', $role)->update([...$data, 'modules' => json_encode($data['modules']), 'updated_at' => now()]);
            User::where('role', $current->name)->update(['role' => $data['name']]);
        });

        return response()->json(['message' => 'Role updated.']);
    }

    public function destroy(int $role): JsonResponse
    {
        DB::transaction(function () use ($role): void {
            $current = DB::table('roles')->where('id', $role)->lockForUpdate()->first();
            abort_unless($current, 404);
            abort_if(in_array($current->name, ['super_admin', 'admin', 'user', 'auditor'], true), 422, 'Built-in roles cannot be deleted.');
            abort_if(User::where('role', $current->name)->exists(), 422, 'Assign users to another role before deleting this role.');
            DB::table('roles')->where('id', $role)->delete();
        });

        return response()->json(['message' => 'Role deleted.']);
    }

    public function users(Request $request): JsonResponse
    {
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'per_page' => ['sometimes', 'integer', Rule::in([10, 20, 50])],
        ]);
        $search = $data['search'] ?? '';
        $users = User::query()->select('id', 'user_code', 'name', 'email', 'role')
            ->where(function ($query) use ($search): void {
                $query->where('name', 'like', '%'.$search.'%')->orWhere('email', 'like', '%'.$search.'%')->orWhere('user_code', 'like', '%'.$search.'%');
            })->orderBy('name')->orderBy('id')->paginate($data['per_page'] ?? 20);

        return response()->json($users);
    }

    public function assign(Request $request, int $user): JsonResponse
    {
        $data = $request->validate(['role' => ['required', 'string', 'max:30']]);
        DB::transaction(function () use ($request, $user, $data): void {
            // Serialize assignments and role changes using the role rows.
            $roles = DB::table('roles')->orderBy('id')->lockForUpdate()->get();
            $role = $roles->firstWhere('name', $data['role']);
            abort_unless($role && $role->active, 422, 'Select an active role.');
            abort_unless(app(RoleAccess::class)->allows($request->user()->fresh(), 'roles'), 403);
            $target = User::whereKey($user)->lockForUpdate()->firstOrFail();
            $actor = $request->user()->fresh();
            abort_if(($target->role === 'super_admin' || $data['role'] === 'super_admin') && $actor->role !== 'super_admin', 403, 'Only a Super Admin can manage Super Admin assignments.');
            abort_if($target->role === 'super_admin' && $data['role'] !== 'super_admin' && User::where('role', 'super_admin')->count() <= 1, 422, 'Keep at least one Super Admin.');
            abort_if($target->role === 'admin' && $data['role'] !== 'admin' && User::where('role', 'admin')->count() <= 1, 422, 'Keep at least one administrator.');
            $target->role = $data['role'];
            $target->save();
        });

        return response()->json(['message' => 'User role assigned.']);
    }

    /** @return array{name: string, description: ?string, active: bool, modules: array} */
    private function validated(Request $request, ?int $role = null): array
    {
        $request->merge(['name' => mb_strtolower(trim((string) $request->input('name')))]);

        return $request->validate([
            'name' => ['required', 'string', 'max:30', 'regex:/^[a-z][a-z0-9 _-]*$/', Rule::unique('roles', 'name')->ignore($role)],
            'description' => ['nullable', 'string', 'max:1000'],
            'active' => ['required', 'boolean'],
            'modules' => ['present', 'array'],
            'modules.*' => ['string', 'distinct', Rule::in(array_keys(config('modules')))],
        ]);
    }
}
