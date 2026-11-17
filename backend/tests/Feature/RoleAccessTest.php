<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use DatabaseMigrations;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function payload(array $overrides = []): array
    {
        return array_replace(['name' => 'manager', 'description' => 'Company manager', 'active' => true, 'modules' => ['dashboard', 'company']], $overrides);
    }

    public function test_management_requires_authentication_and_permission(): void
    {
        $this->getJson('/api/roles')->assertUnauthorized();
        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->getJson('/api/roles')->assertForbidden();
        $this->postJson('/api/roles', $this->payload())->assertForbidden();
        $this->getJson('/api/role-users')->assertForbidden();
        $this->getJson('/api/company')->assertForbidden();
        $this->getJson('/api/activity-logs')->assertForbidden();
        $this->getJson('/api/user')->assertOk()->assertJsonPath('user.modules', ['dashboard']);
    }

    public function test_role_lifecycle_assignment_and_access_revocation(): void
    {
        $admin = $this->admin();
        $user = User::factory()->create();
        $this->actingAs($admin, 'sanctum');
        $id = $this->postJson('/api/roles', $this->payload())->assertCreated()->json('id');
        $this->getJson('/api/roles')->assertOk()->assertJsonCount(5, 'roles');
        $this->putJson('/api/role-users/'.$user->id, ['role' => 'manager'])->assertOk();
        $this->actingAs($user->fresh(), 'sanctum')->getJson('/api/company')->assertOk();
        $this->getJson('/api/roles')->assertForbidden();
        $this->actingAs($admin, 'sanctum')->deleteJson('/api/roles/'.$id)->assertUnprocessable();
        $this->putJson('/api/roles/'.$id, $this->payload(['name' => 'operations', 'active' => false]))->assertOk();
        $this->assertDatabaseHas('users', ['id' => $user->id, 'role' => 'operations']);
        $this->actingAs($user->fresh(), 'sanctum')->getJson('/api/company')->assertForbidden();
        $this->getJson('/api/user')->assertJsonPath('user.modules', []);
        $this->actingAs($admin, 'sanctum')->putJson('/api/role-users/'.$user->id, ['role' => 'operations'])->assertUnprocessable();
        $this->putJson('/api/role-users/'.$user->id, ['role' => 'user'])->assertOk();
        $this->deleteJson('/api/roles/'.$id)->assertOk();
        $this->assertDatabaseMissing('roles', ['id' => $id]);
    }

    public function test_validation_protects_builtin_roles_and_last_administrator(): void
    {
        $admin = $this->admin();
        $this->actingAs($admin, 'sanctum');
        $this->postJson('/api/roles', $this->payload(['modules' => ['unknown']]))->assertUnprocessable();
        $this->postJson('/api/roles', $this->payload(['modules' => ['*']]))->assertUnprocessable();
        $this->postJson('/api/roles', $this->payload(['name' => ' ADMIN ']))->assertUnprocessable();
        $id = DB::table('roles')->where('name', 'admin')->value('id');
        $this->putJson('/api/roles/'.$id, $this->payload())->assertUnprocessable();
        $this->deleteJson('/api/roles/'.$id)->assertUnprocessable();
        $this->putJson('/api/role-users/'.$admin->id, ['role' => 'user'])->assertUnprocessable();
        $this->putJson('/api/role-users/'.$admin->id, ['role' => 'missing'])->assertUnprocessable();
        $this->putJson('/api/roles/9999', $this->payload())->assertNotFound();
        $this->putJson('/api/role-users/9999', ['role' => 'user'])->assertNotFound();
        $second = $this->admin();
        $this->putJson('/api/role-users/'.$second->id, ['role' => 'user'])->assertOk();
    }

    public function test_super_admin_has_full_access_and_exclusive_control_of_super_admin_assignments(): void
    {
        $super = User::factory()->create(['role' => 'super_admin']);
        $admin = $this->admin();
        $user = User::factory()->create();
        $this->actingAs($super, 'sanctum')->getJson('/api/user')->assertJsonPath('user.modules', ['*']);
        $this->getJson('/api/company')->assertOk();
        $id = DB::table('roles')->where('name', 'super_admin')->value('id');
        $this->putJson('/api/roles/'.$id, $this->payload())->assertUnprocessable();
        $this->deleteJson('/api/roles/'.$id)->assertUnprocessable();
        $this->putJson('/api/role-users/'.$super->id, ['role' => 'user'])->assertUnprocessable();
        $this->actingAs($admin, 'sanctum')->putJson('/api/role-users/'.$user->id, ['role' => 'super_admin'])->assertForbidden();
        $this->putJson('/api/role-users/'.$super->id, ['role' => 'user'])->assertForbidden();
        $this->actingAs($super, 'sanctum')->putJson('/api/role-users/'.$user->id, ['role' => 'super_admin'])->assertOk();
        $this->putJson('/api/role-users/'.$user->id, ['role' => 'user'])->assertOk();
    }

    public function test_console_can_bootstrap_super_admin(): void
    {
        $user = User::factory()->create();
        $this->artisan('users:set-role', ['email' => $user->email, 'role' => 'super_admin'])->assertSuccessful();
        $this->assertDatabaseHas('users', ['id' => $user->id, 'role' => 'super_admin']);
    }

    public function test_user_search_returns_pagination_and_excludes_credentials(): void
    {
        $this->actingAs($this->admin(), 'sanctum');
        $user = User::factory()->create(['name' => 'Find this user']);
        $this->getJson('/api/role-users?search=Find%20this')->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $user->id)->assertJsonMissingPath('data.0.password');
        User::factory()->count(11)->create(['name' => 'Paged user']);
        $this->getJson('/api/role-users?search=Paged&per_page=10&page=2')->assertOk()
            ->assertJsonCount(1, 'data')->assertJsonPath('total', 11)->assertJsonPath('from', 11)->assertJsonPath('per_page', 10);
        $this->getJson('/api/role-users?per_page=500')->assertUnprocessable()->assertJsonValidationErrors('per_page');
    }
}
