<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="referrer" content="no-referrer">
    <title>Verify your email</title>
</head>
<body>
    <main>
        <p id="verification-status" role="status">Verifying your email…</p>
        <noscript>Enable JavaScript and reopen the verification link to finish signing up.</noscript>
    </main>
    <script>
        async function verifyEmail() {
            const status = document.getElementById('verification-status');
            const path = new URLSearchParams(location.hash.slice(1)).get('verify');
            if (!path || !/^\/api\/register\/verify\/[a-f0-9-]{36}\?/.test(path)) {
                status.textContent = 'This verification link is invalid.';
                return;
            }

            try {
                const response = await fetch(path, {
                    method: 'POST',
                    headers: { Accept: 'application/json' },
                });
                if (!response.ok) {
                    const messages = {
                        403: 'This link is invalid or has expired. Please sign up again.',
                        409: 'An account already exists with this email address or username.',
                        410: 'This link has expired. Please sign up again.',
                        429: 'Too many verification attempts. Wait a minute, then reopen the same link.',
                    };
                    status.textContent = messages[response.status] || 'Unable to verify your email. Please reopen the same link later.';
                    return;
                }

                history.replaceState(null, '', location.pathname);
                status.textContent = 'Email verified. You can close this tab and return to your original Sign Up page.';
                window.close();
            } catch {
                status.textContent = 'Unable to connect. Please reopen the same link to try again.';
            }
        }

        void verifyEmail();
    </script>
</body>
</html>
