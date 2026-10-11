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
- Decision required: should self-registered barbers start `pending` until admin activation (ties to Task 53) or active immediately?
### Dashboard (BFF / React)
- None — dashboard barbers log in only.
### Mobile (Flutter / Repositories)
- Add a sign-up screen and repository method in the stylist app (built on the shell from Task 82).

## Acceptance Criteria
- [ ] `POST barber/register` with valid data → 201, `data.token` present, `barbers` row created with hashed password.
- [ ] Duplicate email → 422; missing password → 422.
- [ ] The returned token authenticates `GET barber/profile` (200).
- [ ] If the "pending" decision is taken: login of a pending barber → 403 with a stable error code.
- [ ] Feature test `tests/Feature/Barber/RegisterTest.php` covers the above.
- [ ] `php artisan test` passes; PHPStan max + Pint clean.

## Out of Scope
- Stylist app login/router shell — Task 82.
- Activation management — Task 53.
