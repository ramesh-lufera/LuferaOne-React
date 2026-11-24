<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Services\ActivityLogger;
use App\Services\SignInCredentials;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;

class RegisterController extends Controller
{
    public function __invoke(RegisterRequest $request): JsonResponse
    {
        $data = $request->safe()->only(['name', 'email', 'phone', 'username', 'password']);
        $data['terms_accepted_at'] = now()->toDateTimeString();

        $sender = trim((string) config('mail.mailers.smtp.username'));
        $password = preg_replace('/\s+/', '', (string) config('mail.mailers.smtp.password'));
        $useGmail = $sender !== '' && $password !== '';

        if (! $useGmail && config('mail.default') === 'log') {
            return response()->json(['message' => 'Sign-up email is temporarily unavailable.'], 503);
        }

        $pendingId = (string) Str::uuid();
        $expiresAt = now()->addDay();

        try {
            DB::transaction(function () use ($data, $sender, $password, $useGmail, $pendingId, $expiresAt): void {
                $data['password'] = Hash::make($data['password']);
                DB::table('pending_registrations')->where('expires_at', '<=', now())->delete();
                DB::table('pending_registrations')->insert([
                    'id' => $pendingId,
                    'payload' => Crypt::encryptString(json_encode($data, JSON_THROW_ON_ERROR)),
                    'expires_at' => $expiresAt,
                ]);

                $mailer = $useGmail ? Mail::build([
                    'transport' => 'smtp',
                    'scheme' => 'smtps',
                    'host' => 'smtp.gmail.com',
                    'port' => 465,
                    'username' => $sender,
                    'password' => $password,
                    'timeout' => 10,
                ]) : Mail::mailer();

                $logoDisk = Storage::disk('local');
                $logo = $logoDisk->exists(SignInCredentials::EMAIL_LOGO_PATH) ? $logoDisk->get(SignInCredentials::EMAIL_LOGO_PATH) : null;
                $logoSize = $logo ? getimagesizefromstring($logo) : false;
                $logoScale = $logoSize ? min(220 / $logoSize[0], 48 / $logoSize[1], 1) : 1;
                $signedPath = URL::temporarySignedRoute('signup.verify', $expiresAt, ['pending' => $pendingId], absolute: false);
                $verificationUrl = route('signup.verify-page').'#verify='.rawurlencode($signedPath);
                $theme = DB::table('theme_color_settings')->where('id', 1)->first(['color', 'text']);

                $mailer->send(['html' => 'emails.signup-verification', 'text' => 'emails.signup-verification-text'], [
                    'username' => $data['username'],
                    'verificationUrl' => $verificationUrl,
                    'logo' => $logo,
                    'logoMime' => $logoSize['mime'] ?? null,
                    'logoWidth' => $logoSize ? max(1, (int) round($logoSize[0] * $logoScale)) : null,
                    'logoHeight' => $logoSize ? max(1, (int) round($logoSize[1] * $logoScale)) : null,
                    'year' => now()->year,
                    'buttonBackground' => $theme->color ?? '#198487',
                    'buttonText' => $theme->text ?? '#ffffff',
                ], function (Message $message) use ($data, $sender, $useGmail): void {
                    $message->to($data['email'])->subject('Verify your email address for LuferaOne');
                    if ($useGmail) {
                        $message->from($sender, config('mail.from.name'));
                    }
                });
            });
        } catch (TransportExceptionInterface) {
            return response()->json(['message' => 'Unable to send the sign-up email. Please try again later.'], 503);
        }

        $request->attributes->set('activity_skip', true);

        return response()->json([
            'message' => 'Check your email to verify your account.',
            'statusPath' => URL::temporarySignedRoute('signup.status', $expiresAt, ['pending' => $pendingId], absolute: false),
        ], 202)->header('Cache-Control', 'no-store');
    }

    public function status(string $pending): JsonResponse
    {
        $registration = DB::table('pending_registrations')->where('id', $pending)
            ->where('expires_at', '>', now())->selectRaw('payload IS NULL AS verified')->first();
        abort_unless($registration, 410);

        return response()->json(['verified' => (bool) $registration->verified])->header('Cache-Control', 'no-store');
    }

    public function verify(Request $request, string $pending, ActivityLogger $logger): JsonResponse
    {
        try {
            DB::transaction(function () use ($pending, $logger): void {
                $query = DB::table('pending_registrations')->where('id', $pending);
                $registration = $query->lockForUpdate()->first();
                abort_if(! $registration || now()->gte($registration->expires_at), 410, 'This verification link has expired. Please sign up again.');

                if ($registration->payload !== null) {
                    $data = json_decode(Crypt::decryptString($registration->payload), true, 512, JSON_THROW_ON_ERROR);
                    $user = new User($data);
                    $user->forceFill(['email_verified_at' => now()])->save();
                    $logger->record($user, 'Sign Up', 'Sign Up', (string) $user->id);
                    $query->update(['payload' => null]);
                }
            });
        } catch (UniqueConstraintViolationException) {
            abort(409, 'An account already exists with this email address or username.');
        }

        $request->attributes->set('activity_skip', true);

        return response()->json(['message' => 'Registration successful!']);
    }
}
