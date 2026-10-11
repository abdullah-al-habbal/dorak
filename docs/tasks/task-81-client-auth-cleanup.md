# Task 81: Clean Up Client Auth Flows

**Phase:** Phase 14 — Mobile · **Priority:** P2 · **Depends on:** Task 32 (GET client profile), Task 34 (phone OTP), Task 35 (server-side recovery code check) · **Audit source:** Mobile audit — password recovery, `RecoveryRestarted`, HomeScreen, social login, profile restore, phone OTP

## Overview & Root Cause
The client auth layer has local-only or dead paths:
- **Recovery code.** The password-recovery code step marks the code as accepted locally, so a wrong code fails only at `reset-password`.
- **Unused handler.** `RecoveryRestarted` has a handler but nothing dispatches it.
- **Social login.** It has an endpoint builder but no repository method.
- **Session restore.** It only rotates the token, so after a cold start the `client` profile is null.
- **Phone.** It is saved unverified through `PATCH client/profile`.
- **Dead screen.** `HomeScreen` is an unrouted placeholder.

## Evidence
- `frontend/mobile/apps/client_app/lib/src/features/auth/password_recovery.bloc.dart:50-61` — `_onCodeEntered` emits `RecoverySignal.codeAccepted` with no server call.
- `frontend/mobile/apps/client_app/lib/src/features/auth/password_recovery.bloc.dart:14` — `on<RecoveryRestarted>` is registered. The event is defined in `password_recovery.event.dart:41` and never dispatched.
- `frontend/mobile/packages/core/lib/src/network/endpoints/auth.endpoints.dart:15` — `socialLogin(provider)`. There is no matching method in `auth.repository.dart`.
- `frontend/mobile/packages/core/lib/src/session/session.bloc.dart:61-77` — `_onRestore` only calls `refreshToken()`.
- `frontend/mobile/apps/client_app/lib/src/features/home/home.screen.dart` — `HomeScreen` is not referenced anywhere. `app.router.dart:405-407` redirects the legacy home route to the shell.

## Full-Stack Scope
### Backend (API / DB / Policies)
- None in this task. Provided by Task 32 (`GET client/profile`), Task 34 (OTP send/verify), Task 35 (recovery code verify endpoint) and the existing `POST client/social/{provider}`.

### Dashboard (BFF / React)
- None — client-mobile-only flows.

### Mobile (Flutter / Repositories)
- `auth.repository.dart`: add `verifyRecoveryCode(email, code)` (Task 35 endpoint) and `socialLogin(provider, token)`.
- `password_recovery.bloc.dart`: `_onCodeEntered` calls `verifyRecoveryCode`. It emits `codeAccepted` only on success and a field error on 422. Either dispatch `RecoveryRestarted` from the "resend / start over" action in `recovery_otp_content.widget.dart`, or remove the event and its handler.
- `session.bloc.dart` `_onRestore`: after the token refresh, fetch `GET client/profile` through a profile repository method and populate `client`. If that fails, keep the session but mark the profile as stale.
- Phone: `profile_edit` / `profile_completion` blocs route phone changes through the OTP send/verify flow (Task 34) before persisting.
- Social login: add provider buttons in `login_content.widget.dart` behind a config flag. **Decision required:** which providers and SDKs (Google/Apple) ship in v1.
- Delete `home.screen.dart` (dead code), keeping the legacy redirect.

## Acceptance Criteria
- [ ] Bloc test: a wrong recovery code yields a field error and no `codeAccepted` signal; a correct code yields `codeAccepted` after a mocked `200`.
- [ ] `RecoveryRestarted` is either dispatched by a UI action (widget test) or removed (grep finds no references).
- [ ] Session bloc test: cold-start restore produces a non-null `client` with name/phone from the mocked `GET client/profile`.
- [ ] Profile bloc test: changing the phone triggers OTP send and does not call `PATCH client/profile` until verify succeeds.
- [ ] `HomeScreen` is removed and `/home` still redirects to `/discover` (router test).
- [ ] `melos run analyze` and `melos run test` pass.

## Out of Scope
- Backend OTP and recovery endpoints (Tasks 34, 35).
- Delete account UI (Task 80).
