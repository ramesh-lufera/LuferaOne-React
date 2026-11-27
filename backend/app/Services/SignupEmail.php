<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Mail\Mailer;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Mailer\Exception\TransportException;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\Transport\Smtp\SmtpTransport;

class SignupEmail
{
    public function welcomeAfterCommit(User $user, ?string $origin): void
    {
        $loginUrl = $this->frontendOrigin($origin).'/sign-in';
        DB::afterCommit(fn () => $this->sendWelcomeEmail($user, $loginUrl));
    }

    private function sendWelcomeEmail(User $user, string $loginUrl): void
    {
        try {
            $this->signupMailer()->send(['html' => 'emails.signup-welcome', 'text' => 'emails.signup-welcome-text'], [
                ...$this->emailBranding(),
                'name' => $user->name,
                'loginUrl' => $loginUrl,
            ], function (Message $message) use ($user): void {
                $message->to($user->email)->subject('Welcome to LuferaOne!');
            });
        } catch (\Throwable $error) {
            Log::warning('Unable to send sign-up welcome email.', ['user_id' => $user->id, 'exception_type' => $error::class]);
        }
    }

    public function frontendOrigin(?string $origin): string
    {
        $origins = config('cors.allowed_origins', []);

        return rtrim(in_array($origin, $origins, true) ? $origin : (array_values($origins)[0] ?? 'http://localhost:5173'), '/');
    }

    public function signupMailer(): Mailer
    {
        $sender = trim((string) config('mail.mailers.smtp.username'));
        $password = preg_replace('/\s+/', '', (string) config('mail.mailers.smtp.password'));

        if ($sender === '' || $password === '') {
            if (config('mail.default') === 'log') {
                throw new TransportException('Sign-up email is temporarily unavailable.');
            }

            return Mail::mailer();
        }

        $mailer = Mail::build([
            'transport' => 'smtp',
            'scheme' => 'smtps',
            'host' => 'smtp.gmail.com',
            'port' => 465,
            'username' => $sender,
            'password' => $password,
            'timeout' => 5,
            // Prefer IPv4 on Windows, where the default address can time out before SMTP connects.
            'source_ip' => PHP_OS_FAMILY === 'Windows' ? '0.0.0.0' : '',
        ]);
        $mailer->alwaysFrom($sender, config('mail.from.name'));

        $transport = $mailer->getSymfonyTransport();
        if ($transport instanceof SmtpTransport) {
            // Retry the connection before submitting the message to avoid duplicate emails.
            retry(2, fn () => $transport->start(), 0, fn (\Throwable $error): bool => $error instanceof TransportExceptionInterface
                && $error->getCode() < 500);
        }

        return $mailer;
    }

    public function emailBranding(): array
    {
        $logoDisk = Storage::disk('local');
        $logo = $logoDisk->exists(SignInCredentials::EMAIL_LOGO_PATH) ? $logoDisk->get(SignInCredentials::EMAIL_LOGO_PATH) : null;
        $logoSize = $logo ? getimagesizefromstring($logo) : false;
        $logoScale = $logoSize ? min(220 / $logoSize[0], 48 / $logoSize[1], 1) : 1;
        $theme = DB::table('theme_color_settings')->where('id', 1)->first(['color', 'text']);

        return [
            'logo' => $logo,
            'logoMime' => $logoSize['mime'] ?? null,
            'logoWidth' => $logoSize ? max(1, (int) round($logoSize[0] * $logoScale)) : null,
            'logoHeight' => $logoSize ? max(1, (int) round($logoSize[1] * $logoScale)) : null,
            'year' => now()->year,
            'buttonBackground' => $theme->color ?? '#198487',
            'buttonText' => $theme->text ?? '#ffffff',
        ];
    }
}
