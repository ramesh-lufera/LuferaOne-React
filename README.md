# LuferaOne-React
LuferaOne is a modern web application with a responsive interface and robust functionality.


## Registration

The React `/sign-up` form posts JSON to `POST /api/register`. It collects name, email,
phone, username, password, and terms acceptance. Success returns HTTP 201 with a
safe user summary; validation errors return HTTP 422 with a Laravel `errors` map.
Registration does not log the user in or issue tokens. Sanctum remains installed
for future first-party session authentication; no token is stored in browser storage.
Login, logout, password reset, and roles are outside this registration change.

### Local configuration

- In `backend/.env`, set `DB_CONNECTION=mysql`, `DB_HOST`, `DB_PORT`,
  `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` for an existing MySQL database.
  Run `php artisan config:clear`, then `php artisan migrate` from `backend`.
- Set `FRONTEND_URL=http://localhost:5173,http://127.0.0.1:5173` in the backend.
  Production should use the actual HTTPS frontend origin. CORS allows only the
  configured origins. Registration uses JSON without session credentials.
- In `frontend/.env`, set `VITE_API_URL=http://localhost:8000/api`.
  Start Laravel with `php artisan serve` and React with `npm run dev` in their
  respective directories. Restart Vite after changing frontend environment values.
- Set `VITE_SIGNUP_IMAGE_URL` and `VITE_SIGNUP_LOGO_URL` to the original artwork
  and logo URLs or public asset paths. Existing theme images are placeholders,
  so the page uses a branded fallback until these assets are supplied.
- Set `VITE_PRIVACY_POLICY_URL` to the published privacy policy. The terms link
  uses the existing `/terms-condition` page; replace its template legal content
  before launch. The unconfigured privacy label is deliberately not a link.
  Facebook and Google buttons are disabled until OAuth is implemented.

The screenshot establishes fields and wording but does not reveal hidden rules.
Implemented rules: required fields; valid unique email; unique lowercase username
(3–50 letters/numbers/dots/underscores/hyphens); phone with 7–15 digits and optional
leading plus, spaces, parentheses, or hyphens; password of 8–128 characters; terms
acceptance required. Passwords are hashed via the existing User model cast.
The endpoint accepts five attempts per minute per IP. Unknown fields such as role
or email verification status are never assigned. New columns are nullable to
preserve existing users; registration requires them for all new accounts.

### Verification

Run `php artisan test --compact tests/Feature/RegistrationTest.php` in `backend`
for isolated validation, hashing, duplicate handling, throttling, and CORS tests.
The default test suite uses in-memory SQLite. `RegistrationMySqlTest` skips unless
explicitly run with a MySQL connection and wraps its records in a transaction,
leaving no test users behind. Never point the RefreshDatabase test suite at a
populated database. Run `npm run build` in `frontend` to verify production compilation.
