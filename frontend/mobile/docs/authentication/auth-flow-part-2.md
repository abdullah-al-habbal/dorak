---
nodeid: mobile.authentication.auth-flow.part-2
parentnode: mobile.authentication.auth-flow
childnodes: []
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Part 2 of 2 · [Authentication Flow](auth-flow.md) · [Previous](auth-flow.md)

## Verification is non-blocking

`POST /client/register` already returns a valid token, so an unverified account
is authenticated. The verify screen therefore offers "Verify later", which goes
to Home. This is also the only workable behaviour today: the backend runs with
`MAIL_MAILER=log`, so the 6-digit code is written to
`storage/logs/laravel.log` and never delivered.

After a successful registration the code is dispatched automatically. A failure
of that dispatch is swallowed — registration already succeeded, and the verify
screen has a Resend (60-second cooldown).

## Error messages are resolved locally

**Never render `ApiException.message`.** `modules/Core/Lang` defines only four
keys while the Client module references eleven more, and the translator falls
back to returning the key, so a rejected login answers with the literal string
`core::messages.invalid_credentials`.

`ErrorFeedback.from` (`packages/feature_error_feedback`) maps the exception to
a local ARB string; all three apps use it.

| Caught | Shown |
| --- | --- |
| `NetworkException` | `errorNetwork` |
| `ValidationException`, field with a safe server message | that message |
| `ValidationException`, field without one | `fieldInvalid` |
| `ACCOUNT_BANNED` / `ACCOUNT_NOT_ACTIVE` | `authAccountSuspended` / `authAccountNotActive` |
| `business_app` login: session ended by `brand_suspended` | `businessBrandSuspended` |
| `business_app` login, branch role: `ACCOUNT_NOT_ACTIVE` | `businessBranchNotActive` (these two are set by the screen) |
| 401 or 403 where the screen passes `unauthorizedMessage` (login) | `loginErrorInvalidCredentials` |
| 422 where the screen passes `unprocessableMessage` | that override (for example `recoveryCodeRejected`) |
| anything else | the screen's `fallbackMessage`, else `errorGeneric` |

**Safe server message** (`SafeServerMessage`): only the `errors` map of a
`ValidationException`, which the server localizes from `Accept-Language`. It is
trimmed, non-empty, at most 200 characters, a single line, not a translation key
(`module::file.key`, `validation.required`) and free of markup.

**Banner for a validation error**, first match: the screen's 422 override → the
joined safe messages → `fallbackMessage` → `errorGeneric`. The joined messages
apply only with `showsFieldMessagesInBanner: true`, which is for forms that show
no inline field errors, so a form never prints a message twice.

Requesting a password-recovery code deliberately treats a validation refusal as
success (`PasswordRecoveryBloc`), so the form cannot reveal whether an account
exists. Keep that; do not surface that refusal.

## Client-side rules

`AuthValidators` mirrors the backend request rules so obvious mistakes do not
round-trip: email format, password `min:8`, confirmation match.

## Not implemented

Social login (Socialite has no configured drivers server-side), authenticated
password change (`/client/password` exists; Track 17), and profile completion
(Stitch 010). (The 401-triggered session-expired redirect is
implemented — see `docs/navigation/guards.md`.)

## Verification

```bash
cd apps/client_app && flutter test test/auth_flow_test.dart
cd packages/core   && flutter test test/auth_repository_test.dart test/session_controller_test.dart
```
