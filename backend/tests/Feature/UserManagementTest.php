<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use DatabaseMigrations;

    private function payload(User $user, array $overrides = []): array
    {
        return array_replace(['name' => $user->name, 'email' => $user->email, 'username' => $user->username, 'phone' => $user->phone], $overrides);
    }

    private function details(User $user, array $overrides = []): void
    {
        DB::table('user_details')->insert(array_replace(['user_id' => $user->id, 'business_name' => 'Example Business', 'date_of_birth' => '1995-02-14', 'address' => '10 Test Road', 'created_at' => now(), 'updated_at' => now()], $overrides));
    }

    private function image(): UploadedFile
    {
        return UploadedFile::fake()->createWithContent('profile.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aOuUAAAAASUVORK5CYII='));
    }

    public function test_management_endpoints_require_users_module_access(): void
    {
        $target = User::factory()->create();
        $url = '/api/users/'.$target->id;
        $this->getJson($url)->assertUnauthorized();
        $this->putJson($url, $this->payload($target))->assertUnauthorized();
        $this->deleteJson($url)->assertUnauthorized();
        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->getJson($url)->assertForbidden();
        $this->putJson($url, $this->payload($target))->assertForbidden();
        $this->deleteJson($url)->assertForbidden();
    }

    public function test_details_include_profile_fields_and_signed_images_and_support_legacy_users(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $target = User::factory()->create();
        $url = '/api/users/'.$target->id;
        $this->getJson($url)->assertOk()->assertJsonPath('user.business_name', null)->assertJsonPath('user.username', null)
            ->assertJsonMissingPath('user.password')->assertJsonMissingPath('user.remember_token');
        $path = $this->image()->store('users', 'local');
        $this->details($target, ['profile_image_path' => $path]);
        $response = $this->getJson($url)->assertOk()->assertJsonPath('user.business_name', 'Example Business')->assertJsonPath('user.date_of_birth', '1995-02-14')
            ->assertJsonMissingPath('user.profile_image_path');
        $this->get($url.'/image')->assertForbidden();
        $this->get($response->json('user.profile_image_url'))->assertOk();
        $this->getJson('/api/users/99999')->assertNotFound();
    }

    public function test_editing_keeps_blank_password_and_upserts_legacy_details(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $target = User::factory()->create();
        $previousPassword = $target->password;
        $this->putJson('/api/users/'.$target->id, $this->payload($target, ['name' => 'Updated User', 'password' => '', 'business_name' => 'New Business', 'date_of_birth' => '1991-01-20']))
            ->assertOk()->assertJsonPath('user.name', 'Updated User')->assertJsonPath('user.business_name', 'New Business')->assertJsonPath('requires_reauthentication', false);
        $this->assertSame($previousPassword, $target->fresh()->password);
        $this->assertDatabaseHas('user_details', ['user_id' => $target->id, 'business_name' => 'New Business']);
        $this->assertDatabaseHas('activity_logs', ['action' => 'Update', 'module' => 'Users', 'entity_id' => (string) $target->id]);
        $duplicate = User::factory()->create();
        $this->putJson('/api/users/'.$target->id, $this->payload($target, ['email' => $duplicate->email]))->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->putJson('/api/users/'.$target->id, $this->payload($target, ['password' => 'weak']))->assertUnprocessable()->assertJsonValidationErrors('password');
        $this->putJson('/api/users/'.$target->id, $this->payload($target, ['role' => 'super_admin']))->assertUnprocessable()->assertJsonValidationErrors('role');
    }

    public function test_editing_replaces_images_changes_password_and_revokes_existing_tokens(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'super_admin']), 'sanctum');
        $target = User::factory()->create();
        $oldImage = $this->image()->store('users', 'local');
        $this->details($target, ['profile_image_path' => $oldImage]);
        $tokenId = $target->createToken('old session')->accessToken->id;
        $this->post('/api/users/'.$target->id, $this->payload($target, ['email' => 'updated@example.test', 'password' => 'New-Password-123!', 'profile_image' => $this->image(), '_method' => 'PUT']), ['Accept' => 'application/json'])->assertOk();
        $this->assertTrue(Hash::check('New-Password-123!', $target->fresh()->password));
        $this->assertNull($target->fresh()->email_verified_at);
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $tokenId]);
        Storage::disk('local')->assertMissing($oldImage);
        $newImage = DB::table('user_details')->where('user_id', $target->id)->value('profile_image_path');
        Storage::disk('local')->assertExists($newImage);
        $this->putJson('/api/users/'.$target->id, $this->payload($target->fresh(), ['remove_profile_image' => true]))->assertOk()->assertJsonPath('user.profile_image_url', null);
        Storage::disk('local')->assertMissing($newImage);
    }

    public function test_deleting_removes_details_tokens_sessions_and_image_and_preserves_audit_history(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'super_admin']), 'sanctum');
        $target = User::factory()->create();
        $path = $this->image()->store('users', 'local');
        $this->details($target, ['profile_image_path' => $path]);
        $tokenId = $target->createToken('session')->accessToken->id;
        DB::table('sessions')->insert(['id' => 'test-session', 'user_id' => $target->id, 'payload' => '', 'last_activity' => time()]);
        $history = app(ActivityLogger::class)->record($target, 'Sign In', 'Sign In');
        $this->deleteJson('/api/users/'.$target->id)->assertOk();
        $this->assertDatabaseMissing('users', ['id' => $target->id]);
        $this->assertDatabaseMissing('user_details', ['user_id' => $target->id]);
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $tokenId]);
        $this->assertDatabaseMissing('sessions', ['id' => 'test-session']);
        Storage::disk('local')->assertMissing($path);
        $this->assertDatabaseHas('activity_logs', ['id' => $history->id, 'user_name' => $target->name]);
        $this->assertDatabaseHas('activity_logs', ['action' => 'Delete', 'module' => 'Users', 'entity_id' => (string) $target->id]);
        $this->deleteJson('/api/users/'.$target->id)->assertNotFound();
    }

    public function test_administrative_accounts_and_last_administrators_are_protected(): void
    {
        $super = User::factory()->create(['role' => 'super_admin']);
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin, 'sanctum')->putJson('/api/users/'.$super->id, $this->payload($super))->assertForbidden();
        $this->deleteJson('/api/users/'.$super->id)->assertForbidden();
        $manager = User::factory()->create();
        DB::table('roles')->where('name', 'user')->update(['modules' => json_encode(['users'])]);
        $this->actingAs($manager, 'sanctum')->putJson('/api/users/'.$admin->id, $this->payload($admin))->assertForbidden();
        $this->deleteJson('/api/users/'.$admin->id)->assertForbidden();
        $this->actingAs($super, 'sanctum')->deleteJson('/api/users/'.$super->id)->assertUnprocessable();
        $this->deleteJson('/api/users/'.$admin->id)->assertUnprocessable();
        User::factory()->create(['role' => 'admin']);
        $this->deleteJson('/api/users/'.$admin->id)->assertOk();
    }

    public function test_self_credential_changes_and_deletion_request_sign_in_again(): void
    {
        $actor = User::factory()->create(['role' => 'user']);
        DB::table('roles')->where('name', 'user')->update(['modules' => json_encode(['users'])]);
        $tokenId = $actor->createToken('session')->accessToken->id;
        $this->actingAs($actor, 'sanctum')->putJson('/api/users/'.$actor->id, $this->payload($actor, ['password' => 'New-Password-123!']))
            ->assertOk()->assertJsonPath('requires_reauthentication', true);
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $tokenId]);
        $this->deleteJson('/api/users/'.$actor->id)->assertOk()->assertJsonPath('requires_reauthentication', true);
        $this->assertDatabaseMissing('users', ['id' => $actor->id]);
    }

    public function test_failed_audit_rolls_back_edits_and_deletion_with_file_and_session_state(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $target = User::factory()->create();
        $oldPassword = $target->password;
        $image = $this->image()->store('users', 'local');
        $this->details($target, ['profile_image_path' => $image]);
        $tokenId = $target->createToken('session')->accessToken->id;
        $this->mock(ActivityLogger::class, function ($mock): void {
            $mock->shouldReceive('record')->andThrow(new \RuntimeException('Audit unavailable'));
        });
        $this->putJson('/api/users/'.$target->id, $this->payload($target, ['name' => 'Changed', 'password' => 'New-Password-123!', 'profile_image' => $this->image()]))->assertServerError();
        $this->assertSame($oldPassword, $target->fresh()->password);
        $this->assertDatabaseHas('users', ['id' => $target->id, 'name' => $target->name]);
        $this->assertDatabaseHas('personal_access_tokens', ['id' => $tokenId]);
        $this->assertSame([$image], Storage::disk('local')->allFiles('users'));
        $this->deleteJson('/api/users/'.$target->id)->assertServerError();
        $this->assertDatabaseHas('users', ['id' => $target->id]);
        $this->assertDatabaseHas('user_details', ['user_id' => $target->id]);
        Storage::disk('local')->assertExists($image);
    }
}
