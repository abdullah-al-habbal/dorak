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
  - **Decision (resolved): verification-only, `SmsSender` contract with a `log` driver, PATCH rejects a changed phone with 422.** The PRD text cited for "phone OTP login" is not present in `backend/docs`; the routes are `auth:client`, so login is out of scope. A vendor driver is a follow-up behind the same contract.

### Implemented contract
- Shared code path: `RequestPhoneOtpHandler` / `VerifyPhoneOtpHandler` with `PhoneOtpEloquentResolver`; the verify response is `ClientProfileResource::make($client)->resolve()`.
- Scope of the rule: active clients only (second route group); unverified-email clients get 403.
- Request: `POST client/phone/otp` `{phone}` (normalized with `PhoneNumberNormalizer`, `+` and 8-15 digits, `throttle:3,1`); `POST client/phone/verify` `{code}` (6 chars, `throttle:5,1`).
- Failure: HTTP 422 `UNPROCESSABLE_ENTITY` for a wrong, expired or locked-out code (5 attempts), for a phone already verified on another client, and for `PATCH client/profile` with a changed phone (`errors.phone`); HTTP 429 beyond the throttle; `phone` and `phone_verified_at` are left unchanged.
- Success: HTTP 200; send dispatches exactly one SMS and caches `{phone, code_hash}` for 10 minutes; verify sets `phone` and `phone_verified_at` in a `lockForUpdate` transaction and returns the 9-key client (`phone_verified_at` added).
- Dashboard: none (no client phone types; lint/typecheck/Vitest/build re-run). Mobile: `core` `ProfileEndpoints.phoneOtp/phoneVerify`, `ProfileRepository.requestPhoneOtp/verifyPhoneOtp` (`updateProfile` no longer takes `phone`), `ClientDto.phoneVerifiedAt`/`phoneVerified`; `client_app` `PhoneVerificationBloc` + screen + `/profile/phone-verify` route, profile edit and profile completion hand a changed phone to it; EN+AR strings. `business_app` and `stylist_app` have no client-phone code and are unchanged. Docs: backend and mobile feature indexes, mobile AGENTS.
- Deviations from the original spec text: the OTP input is a single numeric field and resend has no client-side cooldown (the server throttle returns 429, mapped to a localized message).
### Dashboard (BFF / React)
- None — client-only flow.
### Mobile (Flutter / Repositories)
- Add endpoints and repository methods (`requestPhoneOtp`, `verifyPhoneOtp`) in `packages/core/lib/src/network/endpoints/profile.endpoints.dart` and `profile.repository.dart`.
- Replace direct phone writes in `apps/client_app/lib/src/features/profile/profile_edit.bloc.dart` and `profile_completion.bloc.dart` with a send-code → enter-code flow (new OTP screen registered in `apps/client_app/lib/src/core/navigation/app.router.dart`).

## Acceptance Criteria
- [x] `POST client/phone/otp` returns 200 and dispatches exactly one SMS/notification (faked in tests); a 4th call within the throttle window returns 429.
- [x] `POST client/phone/verify` with a wrong or expired code returns 422 and leaves `phone` unchanged.
- [x] Correct code returns 200; DB row has the new `phone` and non-null `phone_verified_at`.
- [x] `PATCH client/profile` with a changed `phone` no longer updates the phone (422 or field ignored, as decided) — covered by a Feature test.
- [x] Client payload (Task 33 resource) exposes `phone_verified_at`.
- [x] Mobile bloc tests cover send, verify-success and verify-failure states.
- [x] `php artisan test` and `melos run test` pass; Pint clean; PHPStan intentionally skipped per the user's instruction for this task.

## Out of Scope
- Password recovery code checks — Task 35.
