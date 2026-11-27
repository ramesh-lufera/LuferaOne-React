<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\SignInCredentials;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Mail\Transport\ArrayTransport;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Mockery;
use Symfony\Component\Mailer\Exception\TransportException;
use Symfony\Component\Mailer\Transport\Smtp\SmtpTransport;
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
        $response->assertAccepted()->assertJsonMissingPath('user');
        $this->assertDatabaseCount('users', 0);
        $response->assertJsonPath('message', 'Check your email to verify your account.');
        $messages = Mail::mailer('array')->getSymfonyTransport()->messages();
        $this->assertCount(1, $messages);
        $email = $messages->first()->getOriginalMessage();
        $this->assertSame('register@example.test', $email->getTo()[0]->getAddress());
        $this->assertSame('Verify your email address for LuferaOne', $email->getSubject());
        $this->assertStringContainsString('Verify your email address', $email->getTextBody());
        $this->assertStringContainsString('/signup/verify#verify=', $email->getTextBody());
        $this->get('/signup/verify')->assertOk()->assertSee('Verifying your email');
        $verificationPath = $this->verificationPath();
        $statusPath = $response->json('statusPath');
        $this->getJson($statusPath)->assertOk()->assertExactJson(['verified' => false]);
        $this->getJson($statusPath.'&changed=1')->assertForbidden();
        $this->getJson($verificationPath)->assertMethodNotAllowed();
        $this->assertDatabaseCount('users', 0);
        $this->postJson($verificationPath)->assertOk()->assertJsonPath('message', 'Registration successful!');
        $this->getJson($statusPath)->assertOk()->assertExactJson(['verified' => true]);
        $this->postJson($verificationPath)->assertOk();
        $this->assertDatabaseCount('users', 1);
        $messages = Mail::mailer('array')->getSymfonyTransport()->messages();
        $this->assertCount(2, $messages);
        $welcome = $messages->last()->getOriginalMessage();
        $this->assertSame('Welcome to LuferaOne!', $welcome->getSubject());
        $this->assertSame('register@example.test', $welcome->getTo()[0]->getAddress());
        $this->assertStringContainsString('Welcome, Test Person!', $welcome->getHtmlBody());
        $this->assertStringContainsString('Go to Login: http://localhost:5173/sign-in', $welcome->getTextBody());
        $user = User::where('email', 'register@example.test')->firstOrFail();
        $this->assertTrue(Hash::check('secure-password-123', $user->password));
        $this->assertNotSame('secure-password-123', $user->password);
        $this->assertNotNull($user->terms_accepted_at);
        $this->assertNotNull($user->email_verified_at);
        $this->assertSame('+91 98765 43210', $user->phone);
        $this->assertSame('test.person', $user->username);
        $this->assertGuest();
    }

    public function test_fields_are_required_and_no_user_is_created(): void
    {
        $this->postJson('/api/register', [])->assertUnprocessable()->assertJsonValidationErrors(['name', 'email', 'phone', 'username', 'password', 'terms']);
        $this->assertDatabaseCount('users', 0);
        $this->assertCount(0, Mail::mailer('array')->getSymfonyTransport()->messages());
    }

    public function test_registration_uses_saved_gmail_credentials_when_the_default_mailer_logs(): void
    {
        $this->travelTo(now()->setYear(2031));
        DB::table('theme_color_settings')->updateOrInsert(['id' => 1], [
            'palette_id' => 'custom',
            'color' => '#345678',
            'focus' => '#234567',
            'text' => '#fafafa',
        ]);
        $disk = Storage::fake('local');
        $disk->put(SignInCredentials::EMAIL_LOGO_PATH, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aQ1sAAAAASUVORK5CYII='));
        config([
            'mail.default' => 'log',
            'mail.mailers.smtp.username' => 'sender@example.test',
            'mail.mailers.smtp.password' => 'abcd efgh ijkl mnop',
            'mail.from.name' => 'LuferaOne Accounts',
        ]);
        $transport = new ArrayTransport;
        Mail::extend('smtp', function (array $settings) use ($transport): ArrayTransport {
            $this->assertSame('smtp.gmail.com', $settings['host']);
            $this->assertSame('smtps', $settings['scheme']);
            $this->assertSame(465, $settings['port']);
            $this->assertSame('sender@example.test', $settings['username']);
            $this->assertSame('abcdefghijklmnop', $settings['password']);

            return $transport;
        });

        $this->postJson('/api/register', $this->payload())->assertAccepted();

        $this->assertCount(1, $transport->messages());
        $email = $transport->messages()->first()->getOriginalMessage();
        $this->assertSame('sender@example.test', $email->getFrom()[0]->getAddress());
        $this->assertSame('LuferaOne Accounts', $email->getFrom()[0]->getName());
        $this->assertSame('register@example.test', $email->getTo()[0]->getAddress());
        $this->assertStringContainsString('Hello <strong>test.person</strong>', $email->getHtmlBody());
        $this->assertStringContainsString('&copy; 2031 Lufera Infotech.', $email->getHtmlBody());
        $this->assertStringContainsString('cid:', $email->getHtmlBody());
        $this->assertStringContainsString('bgcolor="#345678" style="background-color:#345678;', $email->getHtmlBody());
        $this->assertStringContainsString('color:#fafafa;font-size:15px;font-weight:bold;text-decoration:none;">Verify Email', $email->getHtmlBody());
        $this->assertSame('image/png', $email->getAttachments()[0]->getMediaType().'/'.$email->getAttachments()[0]->getMediaSubtype());

        $verificationPath = $this->verificationPath($email->getTextBody());
        $this->postJson($verificationPath.'&changed=1')->assertForbidden();
        $this->assertDatabaseCount('users', 0);
        $this->postJson($verificationPath)->assertOk();
        $this->assertNotNull(User::where('email', 'register@example.test')->firstOrFail()->email_verified_at);
        $this->assertCount(2, $transport->messages());
        $welcome = $transport->messages()->last()->getOriginalMessage();
        $this->assertSame('LuferaOne Accounts', $welcome->getFrom()[0]->getName());
        $this->assertStringContainsString('cid:', $welcome->getHtmlBody());
        $this->assertStringContainsString('&copy; 2031 Lufera Infotech.', $welcome->getHtmlBody());
        $this->assertStringContainsString('bgcolor="#345678"', $welcome->getHtmlBody());
    }

    public function test_invalid_values_are_rejected(): void
    {
        $this->postJson('/api/register', array_replace($this->payload(), [
            'name' => '   ', 'email' => 'invalid', 'phone' => '-------', 'username' => 'bad name', 'password' => 'short', 'terms' => false,
        ]))->assertUnprocessable()->assertJsonValidationErrors(['name', 'email', 'phone', 'username', 'password', 'terms']);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_registration_retries_a_transient_smtp_connection_failure_and_sends_once(): void
    {
        config([
            'mail.mailers.smtp.username' => 'sender@example.test',
            'mail.mailers.smtp.password' => 'test-app-password',
        ]);
        $transport = Mockery::mock(SmtpTransport::class);
        $transport->shouldReceive('start')->once()->ordered()->andThrow(new TransportException('Connection timed out.'));
        $transport->shouldReceive('start')->once()->ordered();
        $transport->shouldReceive('send')->once()->ordered()->andReturnNull();
        Mail::extend('smtp', fn () => $transport);

        $this->postJson('/api/register', $this->payload())->assertAccepted()->assertJsonStructure(['statusPath']);
        $this->assertDatabaseCount('pending_registrations', 1);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_registration_does_not_retry_an_smtp_authentication_rejection(): void
    {
        config([
            'mail.mailers.smtp.username' => 'sender@example.test',
            'mail.mailers.smtp.password' => 'test-app-password',
        ]);
        $transport = Mockery::mock(SmtpTransport::class);
        $transport->shouldReceive('start')->once()->andThrow(new TransportException('Authentication rejected.', 535));
        $transport->shouldNotReceive('send');
        Mail::extend('smtp', fn () => $transport);

        $this->postJson('/api/register', $this->payload())
            ->assertServiceUnavailable()
            ->assertJsonPath('message', 'Unable to send the sign-up email. Please try again later.');
        $this->assertDatabaseCount('pending_registrations', 0);
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
        ]))->assertAccepted();
        $this->postJson($this->verificationPath())->assertOk();
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

    public function test_signup_rate_limit_does_not_block_email_verification(): void
    {
        $this->postJson('/api/register', $this->payload())->assertAccepted();
        $verificationPath = $this->verificationPath();
        for ($attempt = 0; $attempt < 4; $attempt++) {
            $this->postJson('/api/register', [])->assertUnprocessable();
        }
        $this->postJson('/api/register', [])->assertStatus(429);

        $this->postJson($verificationPath)->assertOk();
        $this->postJson($verificationPath)->assertOk();
        $this->assertDatabaseCount('users', 1);
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
