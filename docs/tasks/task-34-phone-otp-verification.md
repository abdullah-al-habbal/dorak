# Task 34: Implement Phone OTP Verification

**Phase:** Auth & Account · **Priority:** P1 · **Depends on:** Task 32, Task 33 · **Audit source:** Backend audit "known gaps"; product-spec audit — Auth (`backend/docs/02_prd.md:140`); mobile flow checklist (phone OTP missing)

## Overview & Root Cause
The PRD requires phone OTP, but the backend has no OTP, phone-verification or SMS route. The phone number is saved unverified through `PATCH client/profile` (used by the profile-edit and profile-completion screens). Nothing guarantees that a client's phone is reachable, and phone changes are never verified.

## Evidence
- `backend/modules/Client/Routes/Api/V1/client.php:21-37` — no OTP/phone routes; `phone` accepted by `PATCH /profile` (line 32).
- `frontend/mobile/packages/core/lib/src/network/repositories/profile.repository.dart:6` — `updateProfile({…, String? phone})` writes phone directly.
- `backend/modules/Client/Handlers/Client/ForgotPasswordHandler.php:29-44` — existing cached-code pattern (`Cache::put`, 10-minute TTL) that can be reused.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Migration: add `phone_verified_at` (nullable timestamp) to `clients`.
- `POST /api/v1/client/phone/otp` (`auth:client`, throttled) — generate and send a code to the given phone; store hashed code + phone in cache with TTL.
- `POST /api/v1/client/phone/verify` (`auth:client`) — verify the code; on success persist `phone` and `phone_verified_at`.
- `PATCH client/profile` must stop accepting `phone` (or reject a changed phone with 422 pointing to the OTP flow).
- Decision required: SMS provider (none is configured in the repo) and whether phone OTP is also a login method (PRD wording "phone OTP login") or verification only.
### Dashboard (BFF / React)
- None — client-only flow.
### Mobile (Flutter / Repositories)
- Add endpoints and repository methods (`requestPhoneOtp`, `verifyPhoneOtp`) in `packages/core/lib/src/network/endpoints/profile.endpoints.dart` and `profile.repository.dart`.
- Replace direct phone writes in `apps/client_app/lib/src/features/profile/profile_edit.bloc.dart` and `profile_completion.bloc.dart` with a send-code → enter-code flow (new OTP screen registered in `apps/client_app/lib/src/core/navigation/app.router.dart`).

## Acceptance Criteria
- [ ] `POST client/phone/otp` returns 200 and dispatches exactly one SMS/notification (faked in tests); a 4th call within the throttle window returns 429.
- [ ] `POST client/phone/verify` with a wrong or expired code returns 422 and leaves `phone` unchanged.
- [ ] Correct code returns 200; DB row has the new `phone` and non-null `phone_verified_at`.
- [ ] `PATCH client/profile` with a changed `phone` no longer updates the phone (422 or field ignored, as decided) — covered by a Feature test.
- [ ] Client payload (Task 33 resource) exposes `phone_verified_at`.
- [ ] Mobile bloc tests cover send, verify-success and verify-failure states.
- [ ] `php artisan test` and `melos run test` pass; PHPStan max + Pint clean.

## Out of Scope
- Password recovery code checks — Task 35.
