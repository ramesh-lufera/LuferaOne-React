<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_matching_credentials_issue_a_token_and_allow_user_access(): void
    {
        $user = User::factory()->create(['password' => 'Demo@12345']);
        $response = $this->postJson('/api/login', ['email' => $user->email, 'password' => 'Demo@12345']);
        $response->assertOk()->assertJsonPath('user.id', $user->id)->assertJsonMissingPath('user.password');
        $this->withToken($response->json('token'))->getJson('/api/user')->assertOk()->assertJsonPath('user.id', $user->id);
    }

    public function test_wrong_password_and_unknown_email_are_rejected(): void
    {
        $user = User::factory()->create(['password' => 'Demo@12345']);
        foreach ([$user->email, 'unknown@example.com'] as $email) {
            $this->postJson('/api/login', ['email' => $email, 'password' => 'wrong'])->assertUnauthorized()->assertJsonMissingPath('token');
        }
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_missing_credentials_and_unauthenticated_access_are_rejected(): void
    {
        $this->postJson('/api/login', [])->assertUnprocessable();
        $this->getJson('/api/user')->assertUnauthorized();
        $this->withToken('invalid')->getJson('/api/user')->assertUnauthorized();
    }
}
