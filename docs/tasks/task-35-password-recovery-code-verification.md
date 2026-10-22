# Task 35: Verify Password Recovery Code Server-Side

**Phase:** Auth & Account · **Priority:** P1 · **Depends on:** None · **Audit source:** Mobile audit — password-recovery code check (stub / missing backend action)

## Overview & Root Cause
The forgot-password flow has two steps in the app (enter code, then set a new password), but the backend only checks the code at `POST client/reset-password`. The mobile bloc accepts any code locally on `RecoveryCodeEntered`, so a wrong code is only rejected after the user has typed a new password, and the user is sent back without a clear reason.

## Evidence
- `frontend/mobile/apps/client_app/lib/src/features/auth/password_recovery.bloc.dart:51-59` — `_onCodeEntered` emits `RecoverySignal.codeAccepted` with no server call.
- `backend/modules/Client/Handlers/Client/ResetPasswordHandler.php:23-29` — the cached code is checked and consumed only during reset.
- `backend/modules/Client/Routes/Api/V1/client.php:25-26` — only `forgot-password` and `reset-password` exist.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Add `POST /api/v1/client/forgot-password/verify` (public, throttled) taking `email` + `code`; returns 200 if `Cache::get("password_reset_{id}")` matches, 422 otherwise. It must NOT consume the code (reset still consumes it).
- Add attempt limiting (e.g. invalidate the cached code after 5 failed attempts) shared by verify and reset.
### Dashboard (BFF / React)
- None — client-only flow.
### Mobile (Flutter / Repositories)
- Add `verifyResetCode(email, code)` to `packages/core/lib/src/network/repositories/auth.repository.dart` and the endpoint to `auth.endpoints.dart`.
- `password_recovery.bloc.dart` `_onCodeEntered` calls it and emits `codeAccepted` only on 200; on 422 emits an error signal shown on `recovery_otp.screen.dart`.
### Decision
  - **Decision (best option, resolved): one shared code verifier with a single attempt budget, and a field-shaped 422.** `PasswordResetCodeVerifier` is the only class that issues, checks, or consumes the cached code, so verify and reset cannot drift apart and an attacker cannot reset the budget by switching routes. Returning `VALIDATION_FAILED` + `errors.code` on both routes reuses the mobile `ValidationException` path (`isCodeRejected`) rather than inventing a new error code. Alternatives rejected: per-route counters (doubles the guess budget) and a new `INVALID_RESET_CODE` error code (needs a new mapping in every client for no extra information).

### Implemented contract
- Shared code path: `Modules\Client\Services\PasswordResetCodeVerifier::issue()/verify()/consume()`, used by `ForgotPasswordHandler` (issue, resets the attempt counter), `VerifyResetCodeHandler` (verify only), and `ResetPasswordHandler` (verify, then consume).
- Scope of the rule: the cached code `password_reset_{client_id}` lives 10 minutes; failed attempts are counted in `password_reset_attempts_{client_id}`; the 5th failure (`MAX_ATTEMPTS`) on either route deletes the code.
- Request: `POST /api/v1/client/forgot-password/verify` (public, `throttle:5,1`), body `email` (`required|email`, no `exists`), `code` (`required|string|size:6`).
- Failure: HTTP 422, `code = VALIDATION_FAILED`, `message = core::messages.invalid_reset_code`, `errors = {"code": [message]}` for a wrong, expired, invalidated, or never-issued code and for an unknown email (identical body). `POST client/reset-password` returns the same shape for a bad code. Payload-shape errors are the standard validation 422.
- Success: HTTP 200, no `data`, `message = core::messages.reset_code_verified`; the code is not consumed. Reset still consumes it and revokes all tokens.
- Dashboard: none (client-only flow). Mobile: `core` `AuthEndpoints.verifyResetCode`, `AuthRepository.verifyResetCode`, auth-lifecycle path in `AuthInterceptor`; `client_app` `PasswordRecoveryBloc._onCodeEntered` verifies before emitting `codeAccepted`; `RecoveryOtpScreen` shows `recoveryCodeRejected` on 422 and the new `recoveryCodeThrottled` on 429. Docs: this spec, `docs/decisions-required.md`, `backend/docs/feature-index.md`, `backend/docs/features/BE-19-profile-expand.md`.
- Deviations from the original spec text: none in scope; the reset route's bad-code response moved from a field-less `UNPROCESSABLE_ENTITY` to the `VALIDATION_FAILED` + `errors.code` shape (status unchanged, 422) so both routes match.

## Acceptance Criteria
- [x] `POST client/forgot-password/verify` with the correct code → 200; with a wrong code → 422; with an unknown email → 422 (no account enumeration difference in message).
- [x] After a successful verify, `POST client/reset-password` with the same code still succeeds (code not consumed by verify).
- [x] After 5 wrong attempts the code is invalidated; a following correct code → 422.
- [x] Bloc test: wrong code never emits `RecoverySignal.codeAccepted`.
- [x] `php artisan test` and `melos run test` pass; Pint clean (PHPStan skipped for this run on the user's instruction).

## Out of Scope
- Unused `RecoveryRestarted` event and other client auth cleanup — Task 81.
