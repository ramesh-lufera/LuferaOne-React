<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    private function payload(): array
    {
        return [
            'name' => 'Test Person',
            'email' => 'register@example.test',
            'phone' => '+91 98765 43210',
            'username' => 'test.person',
            'password' => 'secure-password-123',
            'terms' => true,
        ];
    }

    public function test_registration_creates_user_and_hashes_password(): void
    {
        $response = $this->postJson('/api/register', $this->payload() + ['role' => 'admin', 'email_verified_at' => now()]);
        $response->assertCreated()->assertJsonPath('user.email', 'register@example.test')->assertJsonMissingPath('user.password');
        $user = User::where('email', 'register@example.test')->firstOrFail();
        $this->assertTrue(Hash::check('secure-password-123', $user->password));
        $this->assertNotSame('secure-password-123', $user->password);
        $this->assertNotNull($user->terms_accepted_at);
        $this->assertNull($user->email_verified_at);
        $this->assertSame('+91 98765 43210', $user->phone);
        $this->assertSame('test.person', $user->username);
        $this->assertGuest();
    }

    public function test_fields_are_required_and_no_user_is_created(): void
    {
        $this->postJson('/api/register', [])->assertUnprocessable()->assertJsonValidationErrors(['name', 'email', 'phone', 'username', 'password', 'terms']);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_invalid_values_are_rejected(): void
    {
        $this->postJson('/api/register', array_replace($this->payload(), [
            'name' => '   ', 'email' => 'invalid', 'phone' => '-------', 'username' => 'bad name', 'password' => 'short', 'terms' => false,
        ]))->assertUnprocessable()->assertJsonValidationErrors(['name', 'email', 'phone', 'username', 'password', 'terms']);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_non_string_phone_is_a_validation_error(): void
    {
        $this->postJson('/api/register', array_replace($this->payload(), ['phone' => ['invalid']]))
            ->assertUnprocessable()->assertJsonValidationErrors(['phone']);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_email_and_username_are_normalized(): void
    {
        $this->postJson('/api/register', array_replace($this->payload(), [
            'email' => ' REGISTER@EXAMPLE.TEST ', 'username' => ' TEST.PERSON ',
        ]))->assertCreated();
        $this->assertDatabaseHas('users', ['email' => 'register@example.test', 'username' => 'test.person']);
    }

    public function test_duplicate_email_and_username_are_rejected(): void
    {
        User::factory()->create(['email' => 'register@example.test', 'username' => 'test.person']);
        $this->postJson('/api/register', array_replace($this->payload(), ['email' => 'REGISTER@EXAMPLE.TEST']))
            ->assertUnprocessable()->assertJsonValidationErrors(['email', 'username']);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_registration_is_rate_limited(): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/register', [])->assertUnprocessable();
        }
        $this->postJson('/api/register', [])->assertStatus(429);
    }

    public function test_cors_allows_configured_frontend_and_rejects_other_origins(): void
    {
        $this->options('/api/register', [], [
            'Origin' => 'http://localhost:5173', 'Access-Control-Request-Method' => 'POST', 'Access-Control-Request-Headers' => 'content-type',
        ])->assertSuccessful()->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
        $this->options('/api/register', [], [
            'Origin' => 'https://untrusted.example', 'Access-Control-Request-Method' => 'POST',
        ])->assertHeaderMissing('Access-Control-Allow-Origin');
    }
}
