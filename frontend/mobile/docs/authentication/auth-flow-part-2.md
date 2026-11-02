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

`AuthError.from` (`features/auth/auth_error.entity.dart`) maps the exception to
a local ARB string:

| Caught | Shown |
| --- | --- |
| `ValidationException` | per-field `errorText` from `errors` (real Laravel validator messages, safe to show) + a generic banner |
| `ApiException.isUnauthorized` on login | `loginErrorInvalidCredentials` |
| `ApiException` 422 on verify | `verifyErrorInvalid` |
| `NetworkException` | `errorNetwork` |
| anything else | `errorGeneric` |

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
