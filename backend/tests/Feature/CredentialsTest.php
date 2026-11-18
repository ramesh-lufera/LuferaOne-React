<?php

namespace Tests\Feature;

use App\Models\User;
use Dotenv\Dotenv;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class CredentialsTest extends TestCase
{
    use DatabaseMigrations;

    private string $environmentPath;

    private mixed $consoleKernel;

    protected function setUp(): void
    {
        parent::setUp();
        $this->consoleKernel = Artisan::getFacadeRoot();
        $this->environmentPath = tempnam(storage_path('framework'), 'credentials-test-');
        file_put_contents($this->environmentPath, "APP_NAME=Original\nGOOGLE_CLIENT_ID=old-client\nGOOGLE_CLIENT_SECRET=old-secret\nFACEBOOK_APP_ID=old-app\nFACEBOOK_APP_SECRET=old-facebook-secret\n");
        $this->app->useEnvironmentPath(dirname($this->environmentPath));
        $this->app->loadEnvironmentFrom(basename($this->environmentPath));
        config([
            'services.google.client_id' => 'old-client',
            'services.google.client_secret' => 'old-secret',
            'services.facebook.app_id' => 'old-app',
            'services.facebook.app_secret' => 'old-facebook-secret',
        ]);
    }

    protected function tearDown(): void
    {
        Artisan::swap($this->consoleKernel);
        if (isset($this->environmentPath) && is_file($this->environmentPath)) {
            unlink($this->environmentPath);
        }
        parent::tearDown();
    }

    private function payload(): array
    {
        return [
            'googleClientId' => 'new-client.apps.googleusercontent.com',
            'googleClientSecret' => 'new-google-secret',
            'facebookAppId' => '123456789',
            'facebookAppSecret' => 'new-facebook-secret',
        ];
    }

    public function test_settings_require_authentication_and_credentials_permission(): void
    {
        $before = file_get_contents($this->environmentPath);
        $this->getJson('/api/credentials')->assertUnauthorized();
        $this->putJson('/api/credentials', $this->payload())->assertUnauthorized();
        $this->postJson('/api/credentials/activity', ['action' => 'Reset'])->assertUnauthorized();
        $this->actingAs(User::factory()->create(), 'sanctum');
        $this->getJson('/api/credentials')->assertForbidden();
        $this->putJson('/api/credentials', $this->payload())->assertForbidden();
        $this->postJson('/api/credentials/activity', ['action' => 'Reset'])->assertForbidden();
        $this->assertSame($before, file_get_contents($this->environmentPath));
    }

    public function test_page_loads_current_credentials_and_save_persists_sign_in_settings(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $this->getJson('/api/credentials')->assertOk()->assertJsonPath('credentials.googleClientId', 'old-client');
        Artisan::partialMock()->shouldReceive('call')->once()->with('config:clear')->andReturn(0);
        $payload = [...$this->payload(), 'emailUsername' => 'ignored@example.test'];
        $this->putJson('/api/credentials', $payload)->assertOk()->assertJsonPath('credentials', $this->payload());
        $stored = Dotenv::parse(file_get_contents($this->environmentPath));
        $this->assertSame('Original', $stored['APP_NAME']);
        $this->assertSame($payload['googleClientId'], $stored['GOOGLE_CLIENT_ID']);
        $this->assertSame($payload['googleClientSecret'], $stored['GOOGLE_CLIENT_SECRET']);
        $this->assertSame($payload['facebookAppId'], $stored['FACEBOOK_APP_ID']);
        $this->assertSame($payload['facebookAppSecret'], $stored['FACEBOOK_APP_SECRET']);
        $this->assertArrayNotHasKey('emailUsername', $stored);
        $this->getJson('/api/credentials')->assertOk()->assertJsonPath('credentials', $this->payload());
        $this->getJson('/api/auth/settings')->assertOk()->assertJsonPath('googleClientId', $payload['googleClientId'])->assertJsonPath('facebookAppId', $payload['facebookAppId']);
        $this->assertSame($payload['googleClientSecret'], config('services.google.client_secret'));
        $this->assertSame($payload['facebookAppSecret'], config('services.facebook.app_secret'));
    }

    public function test_public_settings_expose_only_ids_and_version(): void
    {
        $response = $this->getJson('/api/auth/settings')->assertOk();
        $this->assertEqualsCanonicalizing(['googleClientId', 'facebookAppId', 'facebookGraphVersion'], array_keys($response->json()));
        $response->assertHeader('Cache-Control', 'no-store, private');
    }

    public function test_file_configuration_changes_and_form_resets_do_not_generate_database_activity(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($user, 'sanctum');
        Artisan::partialMock()->shouldReceive('call')->once()->with('config:clear')->andReturn(0);

        $this->getJson('/api/credentials')->assertOk();
        $this->putJson('/api/credentials', $this->payload())->assertOk();
        $this->postJson('/api/credentials/activity', ['action' => 'Reset', ...$this->payload()])->assertOk();
        $this->postJson('/api/credentials/activity', ['action' => 'Update'])->assertUnprocessable();

        $this->assertDatabaseCount('activity_logs', 0);
        $this->getJson('/api/activity-logs?module=Credentials')->assertOk()->assertJsonPath('recordsFiltered', 0);
    }

    public function test_invalid_or_missing_values_do_not_change_configuration(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        $before = file_get_contents($this->environmentPath);
        $this->putJson('/api/credentials', [])->assertUnprocessable();
        $this->putJson('/api/credentials', [...$this->payload(), 'googleClientSecret' => "secret\nAPP_DEBUG=true"])
            ->assertUnprocessable()->assertJsonValidationErrors('googleClientSecret');
        $this->assertSame($before, file_get_contents($this->environmentPath));
    }

    public function test_environment_special_characters_round_trip_without_interpolation(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']), 'sanctum');
        Artisan::partialMock()->shouldReceive('call')->once()->with('config:clear')->andReturn(0);
        $payload = [...$this->payload(), 'googleClientSecret' => 'secret$APP_NAME"\\#value'];
        $this->putJson('/api/credentials', $payload)->assertOk();
        $stored = Dotenv::parse(file_get_contents($this->environmentPath));
        $this->assertSame($payload['googleClientSecret'], $stored['GOOGLE_CLIENT_SECRET']);
    }
}
