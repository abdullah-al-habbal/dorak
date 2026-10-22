# Task 37: Implement Barber Self Sign-Up

**Phase:** Auth & Account · **Priority:** P1 · **Depends on:** Task 08, Task 09 · **Audit source:** Product-spec audit — Auth, Flow 6.1 (`backend/docs/07_user-flows.md:109`)

## Overview & Root Cause
User Flow 6.1 lets a barber register on their own (freelancer path). The barber API only exposes `POST barber/login`; barbers can only be created by a branch manager (`POST branch/barbers`) or in Filament. Independent freelancers therefore cannot join the platform from the stylist app.

## Evidence
- `backend/modules/Barber/Routes/Api/V1/barber.php:23-24` — only `/barber/login` is public.
- `backend/modules/Branch/Routes/Api/V1/branch.php:35` — `POST /branch/barbers` (`CreateManagedBarberAction`) is the only API creation path.

## Full-Stack Scope
### Backend (API / DB / Policies)
- `POST /api/v1/barber/register` (public, throttled): name, email, password, `is_freelancer`; returns a barber token + barber resource (201), like client register.
- Email verification for barbers (reuse the client verification pattern).
  - **Decision (resolved, best option): start `pending` until admin activation.** Freelancers are listed in Explore and take at-home bookings, so an admin vets them first; the admin activation API from the Activation module already exists, and Task 09 already refuses login for non-enabled barbers. Active-immediately was rejected because it would expose unvetted accounts to clients' homes.
### Implemented contract
- Shared code path: `Modules\Barber\Http\Middleware\EnsureBarberAccountAccess` (status gate for every `auth:barber` route: Barber, Activation, BarberAffiliation, JobPosting route files) and `Modules\Barber\Services\BarberEmailVerification` (send/verify, used by `SendBarberEmailVerificationCodeJob`, `SendEmailVerificationAction`, `VerifyEmailAction`).
- Scope of the rule: `onboarding` = pending or enabled (`GET barber/profile`, `POST barber/email/verify/send`, `POST barber/email/verify`); `approved` = not pending (`POST barbers/{barber}/activate|deactivate`); `active` (default) = enabled (all other barber routes).
- Request: `POST /api/v1/barber/register` (public, `throttle:5,1`): `name` (required, ≤255), `email` (required, email, unique in `barbers`), `password` (required, min 8, confirmed), `is_freelancer` (optional boolean, default `true`), `phone` (optional, ≤20). `POST barber/email/verify`: `code` (6 chars).
- Failure: validation 422 (`errors.email` for a duplicate, `errors.password` when missing/unconfirmed); wrong/expired/locked-out email code 422 `VALIDATION_FAILED` + `errors.code`; a barber outside the route's scope 403 `ACCOUNT_NOT_ACTIVE`; login of a pending barber 403 `ACCOUNT_NOT_ACTIVE` (unchanged Task 09 rule).
- Success: 201 `data.token` + `data.barber` (`BarberResource`, which now includes `email_verified_at`), message `barber::messages.registered_pending_approval`; the barber row is `status = pending`, `has_login = true`, hashed password; `SendBarberEmailVerificationCodeJob` is queued after commit. Verify returns 200 with the barber and sets `email_verified_at`; status stays pending. After admin activation the same token reaches every barber route and login succeeds.
- Dashboard: none (dashboard barbers only log in; no strict schema consumes `BarberResource`). Mobile: `core` `BarberAuthEndpoints.register/sendEmailVerification/verifyEmail` and `BarberRegistrationRepository` (+ Dio impl); `stylist_app` `/signup` route, `StylistSignUpScreen` (form → email code → awaiting approval), `StylistSignUpBloc`, a sign-up link and an `ACCOUNT_NOT_ACTIVE` message on login. The onboarding token lives only in the sign-up bloc and is read first by the app's `ApiClient` token provider; it is dropped when the flow returns to login. `localization`: 10 `stylist*` keys in en/ar. Docs: this spec, `docs/decisions-required.md`, `backend/docs/feature-index.md`, `frontend/mobile/apps/stylist_app/AGENTS.md`, Task 53 and Task 82 notes.
- Deviations from the original spec text: the spec put the sign-up screen on Task 82's shell; a working login/router shell already existed in `stylist_app`, so the screen was added to it now. Every operational barber route now enforces the current status (previously only login did).

### Dashboard (BFF / React)
- None — dashboard barbers log in only.
### Mobile (Flutter / Repositories)
- Add a sign-up screen and repository method in the stylist app (built on the shell from Task 82).

## Acceptance Criteria
- [x] `POST barber/register` with valid data → 201, `data.token` present, `barbers` row created with hashed password.
- [x] Duplicate email → 422; missing password → 422.
- [x] The returned token authenticates `GET barber/profile` (200).
- [x] If the "pending" decision is taken: login of a pending barber → 403 with a stable error code.
- [x] Feature test `tests/Feature/Barber/RegisterTest.php` covers the above.
- [x] `php artisan test` passes; Pint clean (PHPStan skipped for this run on the user's instruction).

## Out of Scope
- Stylist app login/router shell — Task 82.
- Activation management — Task 53.
