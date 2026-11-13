<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Factory;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class FacebookAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private array $debug;

    private array $profile;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.facebook.app_id' => '123456789', 'services.facebook.app_secret' => 'test-app-secret', 'services.facebook.graph_version' => 'v27.0']);
        $this->debug = ['is_valid' => true, 'type' => 'USER', 'app_id' => '123456789', 'user_id' => '987654321', 'expires_at' => time() + 3600, 'data_access_expires_at' => time() + 86400];
        $this->profile = ['id' => '987654321', 'name' => 'Facebook Test User', 'email' => 'facebook-user@example.com', 'picture' => ['data' => ['url' => 'https://platform-lookaside.fbsbx.com/test-photo']]];
        Http::preventStrayRequests();
        Http::fake([
            'https://graph.facebook.com/v27.0/debug_token*' => fn () => Http::response(['data' => $this->debug]),
            'https://graph.facebook.com/v27.0/me*' => fn () => Http::response($this->profile),
        ]);
        $this->withHeaders(['Origin' => 'http://localhost:5173', 'X-Requested-With' => 'XMLHttpRequest']);
    }

    private function payload(string $mode = 'signin'): array
    {
        return ['access_token' => 'test-facebook-access-token', 'mode' => $mode];
    }

    public function test_both_modules_create_new_users_and_persist_the_verified_facebook_photo(): void
    {
        foreach (['signin', 'signup'] as $index => $mode) {
            $this->debug['user_id'] = $this->profile['id'] = (string) (987654321 + $index);
            $this->profile['email'] = 'facebook-user-'.$index.'@example.com';
            $response = $this->postJson('/api/auth/facebook', $this->payload($mode))->assertOk()
                ->assertJsonPath('user.facebook_photo_url', $this->profile['picture']['data']['url'])->assertJsonMissingPath('user.password');
            $this->withToken($response->json('token'))->getJson('/api/user')->assertOk();
        }
        $this->assertDatabaseCount('users', 2);
        $user = User::firstOrFail();
        $this->assertNotNull($user->email_verified_at);
        $this->assertNull($user->terms_accepted_at);
        $this->assertSame('987654321', $user->facebook_id);
    }

    public function test_existing_email_is_linked_without_changing_password_or_profile(): void
    {
        $user = User::factory()->create(['name' => 'Custom Name', 'email' => $this->profile['email'], 'phone' => '1234567890', 'username' => 'custom.username']);
        $original = $user->fresh()->getRawOriginal();
        $this->postJson('/api/auth/facebook', $this->payload())->assertOk()->assertJsonPath('user.id', $user->id);
        foreach (['name', 'email', 'password', 'phone', 'username', 'terms_accepted_at'] as $field) {
            $this->assertSame($original[$field], $user->fresh()->getRawOriginal($field));
        }
        $this->assertSame($this->profile['id'], $user->fresh()->facebook_id);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_repeat_login_keeps_unchanged_rows_and_refreshes_changed_photo_only(): void
    {
        $user = User::factory()->create(['email' => $this->profile['email'], 'facebook_id' => $this->profile['id'], 'facebook_photo_url' => $this->profile['picture']['data']['url'], 'updated_at' => now()->subDay()]);
        $original = $user->fresh()->getRawOriginal();
        $this->postJson('/api/auth/facebook', $this->payload('signup'))->assertOk()->assertJsonPath('user.id', $user->id);
        $this->assertSame($original, $user->fresh()->getRawOriginal());
        $this->profile['picture']['data']['url'] = 'https://platform-lookaside.fbsbx.com/new-photo';
        $this->postJson('/api/auth/facebook', $this->payload())->assertOk();
        $this->assertSame($this->profile['picture']['data']['url'], $user->fresh()->facebook_photo_url);
        $this->assertSame($original['password'], $user->fresh()->password);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_expired_wrong_app_and_invalid_facebook_tokens_are_rejected_before_profile_access(): void
    {
        $original = $this->debug;
        foreach ([['is_valid' => false], ['app_id' => 'another-app'], ['type' => 'APP'], ['user_id' => ''], ['expires_at' => time() - 1], ['data_access_expires_at' => time() - 1]] as $invalid) {
            $this->debug = array_replace($original, $invalid);
            $this->postJson('/api/auth/facebook', $this->payload())->assertUnprocessable();
        }
        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('personal_access_tokens', 0);
        Http::assertNotSent(fn ($request) => str_contains($request->url(), '/me'));
    }

    public function test_mismatched_profile_cannot_sign_in(): void
    {
        $this->profile['id'] = '111111111';
        $this->postJson('/api/auth/facebook', $this->payload())->assertUnprocessable();
        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_missing_email_does_not_create_a_user_but_linked_facebook_user_can_return(): void
    {
        unset($this->profile['email']);
        $this->postJson('/api/auth/facebook', $this->payload())->assertUnprocessable()->assertJsonValidationErrors('facebook');
        $this->assertDatabaseCount('users', 0);
        $user = User::factory()->create(['facebook_id' => $this->profile['id']]);
        $this->postJson('/api/auth/facebook', $this->payload())->assertOk()->assertJsonPath('user.id', $user->id);
    }

    public function test_conflicting_facebook_identity_is_not_overwritten(): void
    {
        $user = User::factory()->create(['email' => $this->profile['email'], 'facebook_id' => '111111111']);
        $this->postJson('/api/auth/facebook', $this->payload())->assertUnprocessable();
        $this->assertSame('111111111', $user->fresh()->facebook_id);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_photo_is_preserved_when_facebook_does_not_supply_a_valid_https_photo(): void
    {
        $user = User::factory()->create(['facebook_id' => $this->profile['id'], 'facebook_photo_url' => 'https://platform-lookaside.fbsbx.com/saved']);
        $this->profile['picture']['data']['url'] = 'javascript:alert(1)';
        $this->postJson('/api/auth/facebook', $this->payload())->assertOk();
        $this->assertSame('https://platform-lookaside.fbsbx.com/saved', $user->fresh()->facebook_photo_url);
        unset($this->profile['picture']);
        $this->postJson('/api/auth/facebook', $this->payload())->assertOk();
        $this->assertSame('https://platform-lookaside.fbsbx.com/saved', $user->fresh()->facebook_photo_url);
    }

    public function test_remember_me_and_app_secret_proof_are_used(): void
    {
        $payload = $this->payload();
        $payload['remember'] = true;
        $this->postJson('/api/auth/facebook', $payload)->assertOk();
        $token = User::firstOrFail()->tokens()->first();
        $this->assertSame(30 * 86400, (int) $token->created_at->diffInSeconds($token->expires_at));
        Http::assertSent(fn ($request) => str_contains($request->url(), '/me')
            && $request->hasHeader('Authorization', 'Bearer test-facebook-access-token')
            && $request['appsecret_proof'] === hash_hmac('sha256', $payload['access_token'], 'test-app-secret'));
    }

    public function test_invalid_origin_and_missing_access_token_are_rejected(): void
    {
        $this->withHeader('Origin', 'https://attacker.example')->postJson('/api/auth/facebook', $this->payload())->assertForbidden();
        $this->withHeader('Origin', 'http://localhost:5173')->postJson('/api/auth/facebook', ['mode' => 'signin'])->assertUnprocessable();
        Http::assertNothingSent();
    }

    public function test_missing_configuration_and_facebook_outage_do_not_create_users(): void
    {
        config(['services.facebook.app_secret' => null]);
        $this->postJson('/api/auth/facebook', $this->payload())->assertStatus(503);
        config(['services.facebook.app_secret' => 'test-app-secret']);
        Http::swap(new Factory);
        Http::preventStrayRequests();
        Http::fake(['https://graph.facebook.com/*' => Http::response([], 503)]);
        $this->postJson('/api/auth/facebook', $this->payload())->assertStatus(503);
        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
