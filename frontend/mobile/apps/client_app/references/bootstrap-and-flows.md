Referenced from [`../AGENTS.md`](../AGENTS.md).

## 2. Bootstrap

```dart
// main.dart
WidgetsFlutterBinding.ensureInitialized();
await dotenv.load();
final preferences = await SharedAppPreferences.create();
runApp(DorakApp(preferences: preferences));
```

`DorakApp.initState` builds, in order: `SecureTokenStorage` → `ApiClient`
(with `tokenProvider`) → `DioAuthRepository` → `AuthBloc` →
`SessionBloc(repository, storage)` → `OnboardingConfigBloc` →
`LocaleBloc`, then starts `session.ready` **unawaited**
and constructs `AppRouter` (go_router, handed to `MaterialApp.router`). The app
layer coordinates the two session blocs: it forwards every `AuthBloc` success
(`state.client != null`) into `SessionBloc.add(SessionAuthenticated(...))`,
alongside the `unauthorizedStream` → `UnauthorizedDetected` forward and the
locale → config reload. The router (two stream listeners) and the api client
subscribe to their streams; all are closed in `dispose()`.

The splash is the router's initial route — it renders from the first frame.
No post-frame push.

Test seams: `DorakApp(tokenStorage:, authRepository:)`. Null in production.

## 3. The launch gate

`AppGate.resolve` — two independent checks, strict order, called from the
router's redirect:

```
await session.ready
A. session.isAuthenticated        -> /home
B. preferences.dontShowOnboarding -> /home
   otherwise                      -> /auth (entry)
```

| Scenario | authenticated | dontShowOnboarding | Lands on |
|---|---|---|---|
| New device | false | false | Auth Entry |
| Guest who saw the tour | false | true | Home |
| Returning logged-in user | true | ignored | Home |
| Just signed up | true | ignored | Home |
| Token revoked server-side | false (cleared) | as stored | B decides |
| Offline start with token | true (kept) | ignored | Home |

Authentication always outranks the onboarding flag.

## 4. Auth flow (Stitch 006–009, 011–014)

```
Auth Entry (006)
├── Log In         -> Login (007)   --success--> Home
│                        └── Forgot Password? -> 011 -> 012 -> 013 -> 014 -> Login
├── Create Account -> Sign Up (008) --success--> Verify (009) --+-> Home
└── Continue as Guest -> onboarding tour        (Verify later)--+
```

Recovery is the only branch that ends at **Login**, not Home — the user signs in
with the new password. It has three backend-imposed quirks (no verify-reset-code
endpoint, so a bad code surfaces on 013; a 10-minute code TTL; and an enumeration
oracle the client refuses to surface). All three are in
`docs/authentication/password_recovery.md` — read it before touching the flow.

Wiring: `app.router.dart`. Every success ends in `router.go(AppRoutes.home)`,
which clears the stack. Logging in **bypasses the tour**; "Continue as Guest" is
its only entry point.

**Verification is non-blocking and backend-owned** — `POST /client/register`
already returns a valid token, so the account is authenticated before
verifying, and the backend dispatches the OTP itself
(`SendEmailVerificationCodeJob`, after commit). The client never calls
`/email/verify/send` on registration — the Resend button is the only
client-side retry. The screen offers "Verify later". This is also the only
workable behaviour while the backend runs `MAIL_MAILER=log` and codes never
leave `storage/logs/laravel.log`.

Files: `login.screen.dart`, `sign_up.screen.dart`, `verify_account.screen.dart`,
plus `widgets/{auth_header, auth_text_field, otp_input_field, login_content,
sign_up_content, verify_account_content}.widget.dart` and
`auth_validators.entity.dart` / `auth_error.entity.dart`. The inline error row
is `design_system`'s `StatusBanner` (promoted from `AuthErrorBanner`, Track 12).
All four auth screens share `widgets/auth_shell.widget.dart` for responsive
layout.

Recovery adds `forgot_password.screen.dart`, `recovery_otp.screen.dart`,
`create_new_password.screen.dart`, `password_reset_success.screen.dart` (a thin
`StatusView` wrapper — its first production consumer), their three content
widgets, and `password_recovery.{bloc,event,state}.dart` +
`recovery_signal.entity.dart`.

**Error messages are resolved locally.** The backend's `message` field is an
untranslated key; `AuthError.from` maps status + exception type to an ARB
string. A 422's `errors` map *is* real Laravel copy and is shown per-field.


## 5. Onboarding flow (Stitch 002–005)

`Welcome (replace) → Discovery → Booking → AI Showcase → Home`, progress dots
`count: 4`, `activeIndex` 0–3.

| Action | `dontShowOnboarding` | Goes to | Next cold start |
|---|---|---|---|
| Skip for now | untouched | Home | tour again |
| Don't show again | `true` | Home | straight to Home |
| Cancel | untouched | stays | — |
| Finish the tour | `true` | Home | straight to Home |

