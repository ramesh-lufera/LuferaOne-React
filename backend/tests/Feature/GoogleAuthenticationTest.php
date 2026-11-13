<?php

namespace Tests\Feature;

use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Factory;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GoogleAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private static ?string $privateKey = null;

    private static array $publicKey = [];

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.google.client_id' => 'test-client.apps.googleusercontent.com']);
        if (self::$privateKey === null) {
            $key = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
            openssl_pkey_export($key, self::$privateKey);
            $details = openssl_pkey_get_details($key);
            self::$publicKey = ['kty' => 'RSA', 'kid' => 'test-key', 'alg' => 'RS256', 'use' => 'sig', 'n' => JWT::urlsafeB64Encode($details['rsa']['n']), 'e' => JWT::urlsafeB64Encode($details['rsa']['e'])];
        }
        Cache::store('file')->forget('google-identity-public-keys');
        Http::preventStrayRequests();
        Http::fake(['https://www.googleapis.com/oauth2/v3/certs' => Http::response(['keys' => [self::$publicKey]])]);
    }

    protected function tearDown(): void
    {
        Cache::store('file')->forget('google-identity-public-keys');
        parent::tearDown();
    }

    private function payload(array $claims = [], string $mode = 'signup'): array
    {
        $nonce = $this->getJson('/api/auth/google/nonce')->assertOk()->json('nonce');
        $claims = array_replace([
            'iss' => 'https://accounts.google.com', 'aud' => config('services.google.client_id'),
            'sub' => 'google-test-subject', 'email' => 'google-user@gmail.com', 'email_verified' => true,
            'name' => 'Google Test User', 'iat' => time(), 'exp' => time() + 3600, 'nonce' => $nonce,
        ], $claims);

        return ['credential' => JWT::encode($claims, self::$privateKey, 'RS256', 'test-key'), 'nonce' => $nonce, 'mode' => $mode, 'terms' => true];
    }

    public function test_google_signup_creates_a_user_and_valid_session_with_accepted_terms(): void
    {
        $response = $this->postJson('/api/auth/google', $this->payload())->assertOk()->assertJsonMissingPath('user.password');
        $user = User::firstOrFail();
        $this->assertSame('google-test-subject', $user->google_id);
        $this->assertNotNull($user->email_verified_at);
        $this->assertNotNull($user->terms_accepted_at);
        $this->withToken($response->json('token'))->getJson('/api/user')->assertOk();
        $this->assertSame(8 * 3600, (int) $user->tokens()->first()->created_at->diffInSeconds($user->tokens()->first()->expires_at));
    }

    public function test_custom_button_code_exchange_authenticates_without_a_browser_id_token(): void
    {
        config(['services.google.client_secret' => 'test-secret']);
        $payload = $this->payload(['nonce' => null]);
        $credential = $payload['credential'];
        unset($payload['credential'], $payload['terms']);
        $payload['code'] = 'single-use-test-code';
        Http::fake(['https://oauth2.googleapis.com/token' => Http::response(['id_token' => $credential])]);
        $this->withHeaders(['Origin' => 'http://localhost:5173', 'X-Requested-With' => 'XMLHttpRequest'])
            ->postJson('/api/auth/google/code', $payload)->assertOk()->assertJsonStructure(['token']);
        $this->assertDatabaseCount('users', 1);
        Http::assertSent(fn ($request) => $request->url() === 'https://oauth2.googleapis.com/token'
            && $request['redirect_uri'] === 'http://localhost:5173'
            && $request['client_secret'] === 'test-secret');
    }

    public function test_custom_button_code_exchange_requires_the_allowed_origin_and_custom_header(): void
    {
        $payload = $this->payload();
        $payload['code'] = 'test-code';
        $this->postJson('/api/auth/google/code', $payload)->assertForbidden();
        $this->withHeaders(['Origin' => 'https://attacker.example', 'X-Requested-With' => 'XMLHttpRequest'])
            ->postJson('/api/auth/google/code', $payload)->assertForbidden();
        $this->assertDatabaseCount('users', 0);
        Http::assertNothingSent();
    }

    public function test_custom_button_code_exchange_rejects_invalid_codes(): void
    {
        config(['services.google.client_secret' => 'test-secret']);
        $payload = $this->payload();
        $payload['code'] = 'expired-code';
        Http::fake(['https://oauth2.googleapis.com/token' => Http::response(['error' => 'invalid_grant'], 400)]);
        $this->withHeaders(['Origin' => 'http://localhost:5173', 'X-Requested-With' => 'XMLHttpRequest'])
            ->postJson('/api/auth/google/code', $payload)->assertUnprocessable();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_both_google_modules_save_and_refresh_the_photo_without_duplicating_users(): void
    {
        $firstPhoto = 'https://lh3.googleusercontent.com/test-profile-one';
        $secondPhoto = 'https://lh3.googleusercontent.com/test-profile-two';
        $this->postJson('/api/auth/google', $this->payload(['picture' => $firstPhoto], 'signin'))
            ->assertOk()->assertJsonPath('user.google_photo_url', $firstPhoto);
        $user = User::firstOrFail();
        $password = $user->password;
        $this->postJson('/api/auth/google', $this->payload(['picture' => $secondPhoto], 'signup'))
            ->assertOk()->assertJsonPath('user.id', $user->id)->assertJsonPath('user.google_photo_url', $secondPhoto);
        $this->assertDatabaseCount('users', 1);
        $this->assertSame($password, $user->fresh()->password);
        $this->postJson('/api/auth/google', $this->payload())->assertOk();
        $this->assertSame($secondPhoto, $user->fresh()->google_photo_url);
    }

    public function test_invalid_google_photo_does_not_overwrite_existing_photo(): void
    {
        $user = User::factory()->create(['google_id' => 'google-test-subject', 'google_photo_url' => 'https://lh3.googleusercontent.com/original']);
        $this->postJson('/api/auth/google', $this->payload(['picture' => 'javascript:alert(1)']))->assertOk();
        $this->assertSame('https://lh3.googleusercontent.com/original', $user->fresh()->google_photo_url);
    }

    public function test_google_signup_allows_unchecked_terms_without_recording_acceptance(): void
    {
        $payload = $this->payload();
        $payload['terms'] = false;
        $this->postJson('/api/auth/google', $payload)->assertOk()->assertJsonStructure(['token']);
        $this->assertDatabaseCount('users', 1);
        $this->assertNull(User::firstOrFail()->terms_accepted_at);
    }

    public function test_google_signin_links_an_existing_authoritative_email_and_remembers_session(): void
    {
        $user = User::factory()->create(['email' => 'google-user@gmail.com']);
        $password = $user->password;
        $payload = $this->payload([], 'signin');
        unset($payload['terms']);
        $payload['remember'] = true;
        $this->postJson('/api/auth/google', $payload)->assertOk()->assertJsonPath('user.id', $user->id);
        $this->assertDatabaseCount('users', 1);
        $this->assertSame($password, $user->fresh()->password);
        $token = $user->tokens()->first();
        $this->assertSame(30 * 86400, (int) $token->created_at->diffInSeconds($token->expires_at));
    }

    public function test_returning_google_subject_signs_in_without_creating_another_user(): void
    {
        $user = User::factory()->create(['google_id' => 'google-test-subject']);
        $this->postJson('/api/auth/google', $this->payload([], 'signin'))->assertOk()->assertJsonPath('user.id', $user->id);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_new_google_account_is_created_from_signin_too(): void
    {
        $payload = $this->payload([], 'signin');
        unset($payload['terms']);
        $this->postJson('/api/auth/google', $payload)->assertOk()->assertJsonStructure(['token']);
        $this->assertDatabaseCount('users', 1);
        $this->assertSame('google-test-subject', User::firstOrFail()->google_id);
        $this->assertNull(User::firstOrFail()->terms_accepted_at);
    }

    public function test_repeat_google_login_preserves_existing_profile_and_does_not_touch_unchanged_row(): void
    {
        $user = User::factory()->create([
            'name' => 'Custom Profile Name', 'email' => 'google-user@gmail.com',
            'google_id' => 'google-test-subject', 'phone' => '1234567890',
            'username' => 'custom.username', 'updated_at' => now()->subDay(),
        ]);
        $original = $user->fresh()->getRawOriginal();
        foreach (['signin', 'signup'] as $mode) {
            $this->postJson('/api/auth/google', $this->payload([], $mode))->assertOk()->assertJsonPath('user.id', $user->id);
            $this->assertSame($original, $user->fresh()->getRawOriginal());
        }
        $this->assertDatabaseCount('users', 1);
    }

    public function test_linked_google_user_only_updates_missing_verification(): void
    {
        $user = User::factory()->unverified()->create(['google_id' => 'google-test-subject']);
        $password = $user->password;
        $this->postJson('/api/auth/google', $this->payload([], 'signin'))->assertOk();
        $this->assertNotNull($user->fresh()->email_verified_at);
        $this->assertSame($password, $user->fresh()->password);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_non_authoritative_email_cannot_take_over_existing_password_account(): void
    {
        User::factory()->create(['email' => 'person@example.com']);
        $this->postJson('/api/auth/google', $this->payload(['email' => 'person@example.com'], 'signin'))->assertUnprocessable();
        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->assertNull(User::first()->google_id);
    }

    public function test_invalid_claims_and_expired_tokens_are_rejected(): void
    {
        foreach ([['aud' => 'another-client'], ['iss' => 'https://attacker.example'], ['exp' => time() - 1], ['email_verified' => false], ['nonce' => 'incorrect'], ['exp' => null]] as $claims) {
            $this->postJson('/api/auth/google', $this->payload($claims))->assertUnprocessable();
        }
        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_malformed_credential_and_replayed_nonce_are_rejected(): void
    {
        $badPayload = $this->payload();
        $badPayload['credential'] = 'not-a-signed-token';
        $this->postJson('/api/auth/google', $badPayload)->assertUnprocessable();
        $payload = $this->payload();
        $this->postJson('/api/auth/google', $payload)->assertOk();
        $this->postJson('/api/auth/google', $payload)->assertUnprocessable();
        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_tampered_signature_is_rejected(): void
    {
        $payload = $this->payload();
        $parts = explode('.', $payload['credential']);
        $parts[2][0] = $parts[2][0] === 'A' ? 'B' : 'A';
        $payload['credential'] = implode('.', $parts);
        $this->postJson('/api/auth/google', $payload)->assertUnprocessable();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_google_key_service_failure_does_not_create_an_account(): void
    {
        Http::swap(new Factory);
        Http::preventStrayRequests();
        Http::fake(['https://www.googleapis.com/oauth2/v3/certs' => Http::response([], 503)]);
        $this->postJson('/api/auth/google', $this->payload())->assertStatus(503);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_missing_google_configuration_fails_without_creating_accounts(): void
    {
        $payload = $this->payload();
        config(['services.google.client_id' => null]);
        $this->postJson('/api/auth/google', $payload)->assertStatus(503);
        $this->assertDatabaseCount('users', 0);
    }
}
