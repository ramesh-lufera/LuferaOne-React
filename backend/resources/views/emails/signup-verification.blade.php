<!doctype html>
<html lang="en">
<body style="margin:0;background:#f3f3f3;color:#171717;font-family:Arial,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f3f3;">
    <tr><td align="center" style="padding:10px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border:1px solid #ddd;border-radius:8px;">
            <tr><td align="center" style="padding:20px;border-bottom:1px solid #e5e5e5;">
                @if ($logoMime)
                    <img src="{{ $message->embedData($logo, 'signup-logo', $logoMime) }}" width="{{ $logoWidth }}" height="{{ $logoHeight }}" alt="Lufera Infotech" style="display:block;max-width:100%;height:auto;">
                @else
                    <span style="color:#006e70;font-size:28px;font-weight:bold;">Lufera Infotech</span>
                @endif
            </td></tr>
            <tr><td style="padding:34px 40px 30px;font-size:15px;line-height:24px;">
                <h1 style="margin:0 0 18px;font-size:20px;line-height:24px;">Verify your email address</h1>
                <p style="margin:0 0 14px;">Hello <strong>{{ $username }}</strong>,</p>
                <p style="margin:0;">You recently created an account at <strong>LuferaOne</strong>. Please verify your email address to activate your account.</p>
                <table role="presentation" align="center" cellspacing="0" cellpadding="0" style="margin:30px auto;">
                    <tr><td bgcolor="{{ $buttonBackground }}" style="background-color:{{ $buttonBackground }};border-radius:4px;">
                        <a href="{{ $verificationUrl }}" style="display:inline-block;padding:12px 28px;color:{{ $buttonText }};font-size:15px;font-weight:bold;text-decoration:none;">Verify Email</a>
                    </td></tr>
                </table>
                <p style="margin:0 0 15px;">If you didn't sign up, you can safely ignore this email.</p>
            </td></tr>
            <tr><td align="center" style="padding:20px;border-top:1px solid #e5e5e5;color:#767676;font-size:12px;line-height:18px;">
                You're receiving this email to verify your LuferaOne account.<br>
                &copy; {{ $year }} Lufera Infotech. All rights reserved.
            </td></tr>
        </table>
    </td></tr>
</table>
</body>
</html>
