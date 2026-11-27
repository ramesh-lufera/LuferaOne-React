<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\TestWith;
use Tests\TestCase;

class MobileSignInTest extends TestCase
{
    use RefreshDatabase;

    private const ORIGIN = 'https://app.example.test';

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'cors.allowed_origins' => [self::ORIGIN],
            'cors.mobile_web_origin' => self::ORIGIN,
            'services.google.client_id' => 'test-google-client',
            'services.google.client_secret' => 'test-google-secret',
            'services.facebook.app_id' => 'test-facebook-app',
            'services.facebook.app_secret' => 'test-facebook-secret',
        ]);
    }

    #[TestWith(['google'])]
    #[TestWith(['facebook'])]
    public function test_mobile_handoff_requires_the_original_verifier_and_can_only_be_used_once(string $provider): void
    {
        $attempt = $this->postJson('/api/auth/mobile/start', ['provider' => $provider, 'remember' => true])
            ->assertOk()
            ->assertHeader('Cache-Control', 'no-store, private')
            ->json();
        $this->assertStringStartsWith(self::ORIGIN.'/mobile-sign-in#', $attempt['url']);
        $this->assertStringNotContainsString($attempt['verifier'], $attempt['url']);

        $user = User::factory()->create();
        $token = $user->createToken($provider.'-sign-in', ['*'], now()->addDays(30))->plainTextToken;
        $handoff = $this->postJson('/api/auth/mobile/authorize', ['state' => $attempt['state']], $this->browserHeaders($token))
            ->assertOk()
            ->assertJsonMissingPath('token')
            ->json();
        $payload = ['state' => $attempt['state'], 'code' => $handoff['code'], 'verifier' => $attempt['verifier']];

        $this->postJson('/api/auth/mobile/exchange', array_replace($payload, ['verifier' => str_repeat('f', 64)]))
            ->assertUnprocessable()
            ->assertJsonMissingPath('token');
        $this->postJson('/api/auth/mobile/exchange', $payload)->assertOk()->assertJsonPath('token', $token);
        $this->postJson('/api/auth/mobile/exchange', $payload)->assertUnprocessable()->assertJsonMissingPath('token');

        $this->app['auth']->forgetGuards();
        $this->getJson('/api/user', ['Authorization' => 'Bearer '.$token])->assertOk()->assertJsonPath('user.id', $user->id);
    }

    public function test_mobile_authorization_requires_a_provider_token_and_the_configured_web_origin(): void
    {
        $attempt = $this->postJson('/api/auth/mobile/start', ['provider' => 'google', 'remember' => false])->assertOk()->json();
        $payload = ['state' => $attempt['state']];
        $this->postJson('/api/auth/mobile/authorize', $payload)->assertUnauthorized();

        $user = User::factory()->create();
        $ordinaryToken = $user->createToken('sign-in')->plainTextToken;
        $this->postJson('/api/auth/mobile/authorize', $payload, $this->browserHeaders($ordinaryToken))->assertForbidden();

        $this->app['auth']->forgetGuards();
        $providerToken = $user->createToken('google-sign-in')->plainTextToken;
        $headers = array_replace($this->browserHeaders($providerToken), ['Origin' => 'https://other.example.test']);
        $this->postJson('/api/auth/mobile/authorize', $payload, $headers)->assertForbidden();
    }

    #[TestWith(['google', true])]
    #[TestWith(['facebook', false])]
    public function test_mobile_signup_handoff_uses_signup_mode_and_preserves_terms(string $provider, bool $terms): void
    {
        $attempt = $this->postJson('/api/auth/mobile/start', [
            'provider' => $provider,
            'remember' => false,
            'mode' => 'signup',
            'terms' => $terms,
        ])->assertOk()->json();

        parse_str(parse_url($attempt['url'], PHP_URL_FRAGMENT), $params);
        $this->assertSame('signup', $params['mode']);
        $this->assertSame((string) (int) $terms, $params['terms']);
        $this->assertSame($attempt['state'], $params['state']);

        $user = User::factory()->create();
        $signInToken = $user->createToken($provider.'-sign-in')->plainTextToken;
        $signUpToken = $user->createToken($provider.'-sign-up')->plainTextToken;
        $payload = ['state' => $attempt['state']];

        $this->postJson('/api/auth/mobile/authorize', $payload, $this->browserHeaders($signInToken))
            ->assertForbidden();
        $this->app['auth']->forgetGuards();
        $code = $this->postJson('/api/auth/mobile/authorize', $payload, $this->browserHeaders($signUpToken))
            ->assertOk()->json('code');

        $this->postJson('/api/auth/mobile/exchange', $payload + ['code' => $code, 'verifier' => $attempt['verifier']])
            ->assertOk()->assertJsonPath('token', $signUpToken);
    }

    public function test_mobile_signup_requires_the_terms_checkbox_state(): void
    {
        $this->postJson('/api/auth/mobile/start', ['provider' => 'google', 'remember' => false, 'mode' => 'signup'])
            ->assertUnprocessable()->assertJsonValidationErrors('terms');
    }

    public function test_pending_handoff_expires(): void
    {
        $attempt = $this->postJson('/api/auth/mobile/start', ['provider' => 'google', 'remember' => false])->assertOk()->json();
        $token = User::factory()->create()->createToken('google-sign-in')->plainTextToken;
        $this->travel(6)->minutes();

        $this->postJson('/api/auth/mobile/authorize', ['state' => $attempt['state']], $this->browserHeaders($token))->assertGone();
    }

    private function browserHeaders(string $token): array
    {
        return [
            'Authorization' => 'Bearer '.$token,
            'Origin' => self::ORIGIN,
            'X-Requested-With' => 'XMLHttpRequest',
        ];
    }
}
