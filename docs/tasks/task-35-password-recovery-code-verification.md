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

## Acceptance Criteria
- [ ] `POST client/forgot-password/verify` with the correct code → 200; with a wrong code → 422; with an unknown email → 422 (no account enumeration difference in message).
- [ ] After a successful verify, `POST client/reset-password` with the same code still succeeds (code not consumed by verify).
- [ ] After 5 wrong attempts the code is invalidated; a following correct code → 422.
- [ ] Bloc test: wrong code never emits `RecoverySignal.codeAccepted`.
- [ ] `php artisan test` and `melos run test` pass; PHPStan max + Pint clean.

## Out of Scope
- Unused `RecoveryRestarted` event and other client auth cleanup — Task 81.
