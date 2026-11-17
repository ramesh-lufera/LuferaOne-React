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

class UserCreationTest extends TestCase
{
    use DatabaseMigrations;

    private function payload(array $overrides = []): array
    {
        return array_replace([
            'name' => 'Created User', 'email' => 'new@example.test', 'username' => 'new.user', 'password' => 'Example-Password-123',
            'phone' => '+919876543210', 'business_name' => 'Example Business', 'gstin' => '33AEZPA0582L1Z7',
            'date_of_birth' => '1995-02-14', 'address' => '10 Test Road', 'city' => 'Trichy', 'state' => 'Tamil Nadu', 'country' => 'India', 'pincode' => '620001',
        ], $overrides);
    }

    private function image(): UploadedFile
    {
        return UploadedFile::fake()->createWithContent('profile.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aOuUAAAAASUVORK5CYII='));
    }

    public function test_creating_users_requires_permission(): void
    {
        $this->postJson('/api/users', $this->payload())->assertUnauthorized();
        $this->actingAs(User::factory()->create(), 'sanctum')->postJson('/api/users', $this->payload())->assertForbidden();
        $this->assertDatabaseCount('user_details', 0);
    }

    public function test_creates_user_and_linked_details_with_hashed_password_and_profile_image(): void
    {
        Storage::fake('local');
        $admin = User::factory()->create(['role' => 'super_admin']);
        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/users', $this->payload(['email' => ' NEW@example.test ', 'username' => ' NEW.USER ', 'gstin' => '33aezpa0582l1z7']) + ['profile_image' => $this->image()])
            ->assertCreated()->assertJsonPath('user.role', 'user')->assertJsonPath('user.email', 'new@example.test')->assertJsonMissingPath('user.password');
        $id = $response->json('user.id');
        $this->assertTrue(Hash::check('Example-Password-123', User::findOrFail($id)->password));
        $this->assertDatabaseHas('users', ['id' => $id, 'username' => 'new.user']);
        $this->assertDatabaseHas('user_details', ['user_id' => $id, 'business_name' => 'Example Business', 'gstin' => '33AEZPA0582L1Z7', 'date_of_birth' => '1995-02-14', 'address' => '10 Test Road', 'city' => 'Trichy', 'state' => 'Tamil Nadu', 'country' => 'India', 'pincode' => '620001']);
        Storage::disk('local')->assertExists(DB::table('user_details')->where('user_id', $id)->value('profile_image_path'));
        $this->assertDatabaseHas('activity_logs', ['action' => 'Create', 'module' => 'Users', 'entity_id' => (string) $id]);
        $this->postJson('/api/login', ['email' => 'new@example.test', 'password' => 'Example-Password-123'])->assertOk()->assertJsonPath('user.role', 'user');
    }

    public function test_validates_duplicates_optional_details_and_rejects_privilege_injection(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $this->postJson('/api/users', $this->payload(['password' => 'short', 'gstin' => 'invalid', 'date_of_birth' => now()->addDay()->toDateString()]))
            ->assertUnprocessable()->assertJsonValidationErrors(['password', 'gstin', 'date_of_birth']);
        $this->postJson('/api/users', $this->payload(['role' => 'super_admin']))->assertUnprocessable()->assertJsonValidationErrors('role');
        $minimal = ['name' => 'Minimal User', 'email' => 'minimal@example.test', 'username' => 'minimal', 'password' => 'Example-Password-123', 'date_of_birth' => '   '];
        $this->postJson('/api/users', $minimal)->assertCreated();
        $this->postJson('/api/users', $minimal)->assertUnprocessable()->assertJsonValidationErrors(['email', 'username']);
        $this->assertDatabaseCount('user_details', 1);
        $this->assertDatabaseHas('user_details', ['date_of_birth' => null]);
    }

    public function test_new_passwords_require_length_mixed_case_numbers_and_a_symbol(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        foreach (['Short1!', 'alllowercase1!', 'ALLUPPERCASE1!', 'NoNumbersHere!', 'NoSymbolsHere12', 'UpperLower12 '] as $password) {
            $this->postJson('/api/users', $this->payload(['password' => $password]))
                ->assertUnprocessable()->assertJsonValidationErrors('password');
        }
        $this->assertDatabaseMissing('users', ['email' => 'new@example.test']);
    }

    public function test_audit_failure_rolls_back_both_records_and_uploaded_image(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $this->mock(ActivityLogger::class, function ($mock): void {
            $mock->shouldReceive('record')->andThrow(new \RuntimeException('Audit unavailable'));
        });
        $this->postJson('/api/users', $this->payload() + ['profile_image' => $this->image()])->assertServerError();
        $this->assertDatabaseMissing('users', ['email' => 'new@example.test']);
        $this->assertDatabaseCount('user_details', 0);
        $this->assertSame([], Storage::disk('local')->allFiles('users'));
    }
}
