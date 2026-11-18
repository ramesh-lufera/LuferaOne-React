<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\UserIdentifier;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class UserIdentifierTest extends TestCase
{
    use DatabaseMigrations;

    public function test_identifiers_are_generated_for_each_user_and_do_not_change_on_update(): void
    {
        $users = User::factory()->count(25)->create();
        $this->assertSame(25, $users->pluck('user_code')->unique()->count());
        foreach ($users as $user) {
            $this->assertMatchesRegularExpression('/^[A-Z]{3}[0-9]{3}$/', $user->user_code);
        }
        $user = $users->first();
        $code = $user->user_code;
        $user->update(['name' => 'Updated User']);
        $this->assertSame($code, $user->fresh()->user_code);
        $this->expectException(\LogicException::class);
        $user->forceFill(['user_code' => 'NEW123'])->save();
    }

    public function test_collisions_are_retried_and_database_rejects_duplicates(): void
    {
        $existing = User::factory()->create();
        $this->mock(UserIdentifier::class)->shouldReceive('generate')->twice()->andReturn($existing->user_code, 'NEW123');
        $created = DB::transaction(fn () => User::factory()->create());
        $this->assertSame('NEW123', $created->user_code);
        $this->expectException(UniqueConstraintViolationException::class);
        DB::table('users')->where('id', $created->id)->update(['user_code' => $existing->user_code]);
    }

    public function test_signup_admin_creation_and_profile_expose_read_only_identifier(): void
    {
        $signup = ['name' => 'Signup User', 'email' => 'signup@example.test', 'phone' => '+91 9876543210', 'username' => 'signup.user', 'password' => 'Strong-Password-123!', 'terms' => true];
        $response = $this->postJson('/api/register', $signup)->assertCreated();
        $code = $response->json('user.user_code');
        $this->assertMatchesRegularExpression('/^[A-Z]{3}[0-9]{3}$/', $code);
        $user = User::where('email', $signup['email'])->firstOrFail();
        $this->actingAs($user, 'sanctum');
        $this->getJson('/api/profile')->assertOk()->assertJsonPath('user.user_code', $code);
        $this->putJson('/api/profile', ['name' => $user->name, 'email' => $user->email, 'username' => $user->username, 'user_code' => 'NEW123'])->assertUnprocessable()->assertJsonValidationErrors('user_code');
        $this->assertSame($code, $user->fresh()->user_code);
        $this->actingAs(User::factory()->create(['role' => 'super_admin']), 'sanctum');
        $created = $this->postJson('/api/users', ['name' => 'Managed User', 'email' => 'managed@example.test', 'username' => 'managed.user', 'password' => 'Strong-Password-123!'])->assertCreated();
        $managedCode = $created->json('user.user_code');
        $this->getJson('/api/users/'.$created->json('user.id'))->assertOk()->assertJsonPath('user.user_code', $managedCode);
        $this->getJson('/api/users?search='.$managedCode)->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.user_code', $managedCode);
        $this->putJson('/api/users/'.$user->id, ['name' => $user->name, 'email' => $user->email, 'user_code' => 'NEW123'])->assertUnprocessable()->assertJsonValidationErrors('user_code');
        $this->postJson('/api/register', [...$signup, 'email' => 'another@example.test', 'username' => 'another.user', 'user_code' => 'NEW123'])->assertUnprocessable()->assertJsonValidationErrors('user_code');
    }

    public function test_migration_backfills_existing_users_without_changing_internal_ids_or_details(): void
    {
        $users = User::factory()->count(3)->create();
        $original = $users->map(fn ($user) => $user->only(['id', 'email', 'password']))->all();
        $migration = require glob(database_path('migrations/*_add_user_code_to_users_table.php'))[0];
        $migration->down();
        $migration->up();
        foreach ($original as $user) {
            $record = DB::table('users')->find($user['id']);
            $this->assertSame($user['email'], $record->email);
            $this->assertSame($user['password'], $record->password);
            $this->assertMatchesRegularExpression('/^[A-Z]{3}[0-9]{3}$/', $record->user_code);
        }
        $this->assertSame(3, DB::table('users')->distinct()->count('user_code'));
    }

    public function test_format_migration_replaces_old_codes_and_preserves_matching_codes_and_relationships(): void
    {
        $legacy = User::factory()->create();
        $matching = User::factory()->create();
        DB::table('users')->where('id', $legacy->id)->update(['user_code' => 'A7K2Q9']);
        DB::table('users')->where('id', $matching->id)->update(['user_code' => 'ABC007']);
        DB::table('user_details')->insert(['user_id' => $legacy->id, 'city' => 'Chennai']);
        $migration = require glob(database_path('migrations/*_normalize_user_codes_to_three_letters_and_three_digits.php'))[0];
        $migration->up();
        $code = $legacy->fresh()->user_code;
        $this->assertMatchesRegularExpression('/^[A-Z]{3}[0-9]{3}$/', $code);
        $this->assertSame('ABC007', $matching->fresh()->user_code);
        $this->assertDatabaseHas('user_details', ['user_id' => $legacy->id, 'city' => 'Chennai']);
        $migration->up();
        $this->assertSame($code, $legacy->fresh()->user_code);
    }
}
