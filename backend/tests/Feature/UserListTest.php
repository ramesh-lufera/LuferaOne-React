<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class UserListTest extends TestCase
{
    use DatabaseMigrations;

    public function test_user_list_requires_authentication_and_users_module_access(): void
    {
        $this->getJson('/api/users')->assertUnauthorized();
        $actor = User::factory()->create(['role' => 'user']);
        $this->actingAs($actor, 'sanctum')->getJson('/api/users')->assertForbidden();
        DB::table('roles')->where('name', 'user')->update(['modules' => json_encode(['users'])]);
        $this->getJson('/api/users')->assertOk();
        DB::table('roles')->where('name', 'user')->update(['active' => false]);
        $this->getJson('/api/users')->assertForbidden();
    }

    public function test_user_list_returns_database_fields_without_credentials_or_provider_data(): void
    {
        $actor = User::factory()->create(['role' => 'super_admin']);
        $user = User::factory()->create(['name' => 'Listed user', 'email' => 'listed@example.test', 'username' => 'listed-user', 'phone' => '+919876543210']);
        $response = $this->actingAs($actor, 'sanctum')->getJson('/api/users?search=listed-user')->assertOk()
            ->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $user->id)
            ->assertJsonPath('data.0.phone', '+919876543210')->assertJsonPath('data.0.role', 'user');
        $this->assertEqualsCanonicalizing(['id', 'name', 'email', 'username', 'phone', 'role', 'created_at'], array_keys($response->json('data.0')));
        $this->getJson('/api/users?search=9876543210')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/users?search=listed%40example.test')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_user_list_supports_pagination_validation_and_empty_results(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        User::factory()->count(11)->create(['name' => 'Paged User']);
        $this->getJson('/api/users?search=Paged&per_page=10&page=2')->assertOk()
            ->assertJsonCount(1, 'data')->assertJsonPath('total', 11)->assertJsonPath('from', 11)->assertJsonPath('last_page', 2);
        $this->getJson('/api/users?search=Paged&per_page=20')->assertOk()->assertJsonCount(11, 'data');
        $this->getJson('/api/users?search=missing-user')->assertOk()->assertJsonCount(0, 'data')->assertJsonPath('total', 0);
        $this->getJson('/api/users?per_page=999')->assertUnprocessable()->assertJsonValidationErrors('per_page');
        $this->getJson('/api/users?page=0')->assertUnprocessable()->assertJsonValidationErrors('page');
    }
}
