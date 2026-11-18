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

class ProfileTest extends TestCase
{
    use DatabaseMigrations;

    private function payload(User $user, array $extra = []): array
    {
        return array_replace(['name' => $user->name, 'email' => $user->email, 'username' => $user->username], $extra);
    }

    private function image(): UploadedFile
    {
        return UploadedFile::fake()->createWithContent('image.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aOuUAAAAASUVORK5CYII='));
    }

    public function test_authentication_and_self_only_access_without_users_permission(): void
    {
        $this->getJson('/api/profile')->assertUnauthorized();
        $this->putJson('/api/profile')->assertUnauthorized();
        $this->putJson('/api/profile/password')->assertUnauthorized();
        $user = User::factory()->create();
        $other = User::factory()->create();
        $this->actingAs($user, 'sanctum');
        $this->getJson('/api/profile')->assertOk()->assertJsonPath('user.id', $user->id)->assertJsonPath('user.business_name', null)->assertJsonMissingPath('user.password')->assertJsonMissingPath('user.remember_token');
        $this->putJson('/api/profile', $this->payload($user, ['user_id' => $other->id, 'role' => 'super_admin', 'password' => 'Secret-Password-123!']))->assertUnprocessable()->assertJsonValidationErrors(['user_id', 'role', 'password']);
        $this->getJson('/api/users/'.$other->id)->assertForbidden();
        $this->assertSame('user', $user->fresh()->role);
        $this->assertSame($other->email, $other->fresh()->email);
    }

    public function test_profile_persists_fields_and_validates_existing_user_rules(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create(['username' => 'occupied']);
        $this->actingAs($user, 'sanctum');
        $data = $this->payload($user, ['name' => ' Updated User ', 'email' => ' UPDATED@EXAMPLE.TEST ', 'username' => ' Updated.User ', 'phone' => '+91 9876543210', 'business_name' => 'Lufera', 'gstin' => '27AAPFU0939F1ZV', 'date_of_birth' => '1990-01-02', 'address' => 'Test Road', 'city' => 'Chennai', 'state' => 'Tamil Nadu', 'country' => 'India', 'pincode' => '600001']);
        $this->putJson('/api/profile', $data)->assertOk()->assertJsonPath('user.name', 'Updated User')->assertJsonMissingPath('user.password');
        $this->getJson('/api/profile')->assertOk()->assertJsonPath('user.email', 'updated@example.test')->assertJsonPath('user.username', 'updated.user')->assertJsonPath('user.business_name', 'Lufera')->assertJsonPath('user.date_of_birth', '1990-01-02');
        $this->assertNull($user->fresh()->email_verified_at);
        $this->assertDatabaseHas('user_details', ['user_id' => $user->id, 'city' => 'Chennai', 'pincode' => '600001']);
        $this->putJson('/api/profile', $this->payload($user->fresh(), ['email' => $other->email, 'username' => $other->username, 'gstin' => 'invalid', 'date_of_birth' => '2999-01-01', 'phone' => 'abc']))->assertUnprocessable()->assertJsonValidationErrors(['email', 'username', 'gstin', 'date_of_birth', 'phone']);
    }

    public function test_images_are_saved_replaced_removed_and_signed(): void
    {
        Storage::fake('local');
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');
        $upload = fn () => $this->post('/api/profile', $this->payload($user, ['_method' => 'PUT', 'profile_image' => $this->image(), 'cover_image' => $this->image()]), ['Accept' => 'application/json']);
        $response = $upload()->assertOk();
        $old = DB::table('user_details')->where('user_id', $user->id)->first();
        Storage::disk('local')->assertExists([$old->profile_image_path, $old->cover_image_path]);
        $this->get('/api/users/'.$user->id.'/cover')->assertForbidden();
        $this->get($response->json('user.cover_image_url'))->assertOk();
        $this->get($response->json('user.profile_image_url'))->assertOk();
        $this->getJson('/api/profile')->assertJsonMissingPath('user.cover_image_path')->assertJsonMissingPath('user.profile_image_path');
        $replacement = $upload()->assertOk();
        $this->assertNotSame($response->json('user.cover_image_url'), $replacement->json('user.cover_image_url'));
        Storage::disk('local')->assertMissing([$old->profile_image_path, $old->cover_image_path]);
        $updated = DB::table('user_details')->where('user_id', $user->id)->first();
        $this->putJson('/api/profile', $this->payload($user, ['remove_profile_image' => true, 'remove_cover_image' => true]))->assertOk()->assertJsonPath('user.cover_image_url', null);
        Storage::disk('local')->assertMissing([$updated->profile_image_path, $updated->cover_image_path]);
        $this->getJson('/api/profile')->assertJsonPath('user.profile_image_url', null);
        $this->post('/api/profile', $this->payload($user, ['_method' => 'PUT', 'cover_image' => UploadedFile::fake()->create('bad.txt', 1)]), ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('cover_image');
        $this->post('/api/profile', $this->payload($user, ['_method' => 'PUT', 'profile_image' => UploadedFile::fake()->create('big.png', 2049, 'image/png')]), ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('profile_image');
    }

    public function test_audit_failure_rolls_back_new_images_and_profile_changes(): void
    {
        Storage::fake('local');
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');
        $this->mock(ActivityLogger::class)->shouldReceive('record')->andThrow(new \RuntimeException('Audit unavailable'));
        $this->post('/api/profile', $this->payload($user, ['_method' => 'PUT', 'name' => 'Changed', 'cover_image' => $this->image()]), ['Accept' => 'application/json'])->assertServerError();
        $this->assertSame($user->name, $user->fresh()->name);
        $this->assertSame([], Storage::disk('local')->allFiles('users'));
        $this->assertDatabaseMissing('user_details', ['user_id' => $user->id]);
    }

    public function test_password_validation_rejects_incorrect_same_weak_and_mismatched_passwords(): void
    {
        $user = User::factory()->create(['password' => 'Current-Password-123!']);
        $this->actingAs($user, 'sanctum');
        $base = ['current_password' => 'Current-Password-123!', 'password' => 'New-Password-123!', 'password_confirmation' => 'New-Password-123!'];
        foreach ([['current_password' => 'wrong'], ['password' => 'Current-Password-123!', 'password_confirmation' => 'Current-Password-123!'], ['password_confirmation' => 'Mismatch-Password-123!'], ['password' => 'weak', 'password_confirmation' => 'weak']] as $invalid) {
            $this->putJson('/api/profile/password', array_replace($base, $invalid))->assertUnprocessable()->assertJsonValidationErrors(isset($invalid['current_password']) ? 'current_password' : 'password');
        }
        $this->assertTrue(Hash::check('Current-Password-123!', $user->fresh()->password));
    }

    public function test_password_attempts_are_limited_per_user(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');
        $data = ['current_password' => 'wrong', 'password' => 'New-Password-123!', 'password_confirmation' => 'New-Password-123!'];
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->putJson('/api/profile/password', $data)->assertUnprocessable();
        }
        $this->putJson('/api/profile/password', $data)->assertTooManyRequests();
        $this->getJson('/api/profile')->assertOk();
        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->putJson('/api/profile/password', $data)->assertUnprocessable();
    }

    public function test_user_deletion_cleans_up_cover_pictures(): void
    {
        Storage::fake('local');
        $user = User::factory()->create();
        $path = $this->image()->store('users', 'local');
        DB::table('user_details')->insert(['user_id' => $user->id, 'cover_image_path' => $path]);
        $this->actingAs(User::factory()->create(['role' => 'super_admin']), 'sanctum');
        $this->deleteJson('/api/users/'.$user->id)->assertOk();
        Storage::disk('local')->assertMissing($path);
    }

    public function test_password_change_hashes_password_retains_current_token_and_revokes_other_sessions(): void
    {
        $user = User::factory()->create(['password' => 'Current-Password-123!']);
        $current = $user->createToken('current');
        $other = $user->createToken('other');
        DB::table('sessions')->insert(['id' => 'other-session', 'user_id' => $user->id, 'payload' => '', 'last_activity' => time()]);
        $this->withToken($current->plainTextToken)->putJson('/api/profile/password', ['current_password' => 'Current-Password-123!', 'password' => 'New-Password-123!', 'password_confirmation' => 'New-Password-123!'])->assertOk()->assertJsonMissingPath('password');
        $this->assertTrue(Hash::check('New-Password-123!', $user->fresh()->password));
        $this->assertDatabaseMissing('sessions', ['id' => 'other-session']);
        $this->assertDatabaseHas('personal_access_tokens', ['id' => $current->accessToken->id]);
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $other->accessToken->id]);
        $this->withToken($current->plainTextToken)->getJson('/api/profile')->assertOk();
        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'New-Password-123!'])->assertOk();
    }
}
