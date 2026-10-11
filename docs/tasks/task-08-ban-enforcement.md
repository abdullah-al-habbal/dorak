# Task 08: Enforce Client and Barber Bans at Login and Booking

**Phase:** 1 — Security & Authorization · **Priority:** P0 · **Depends on:** None · **Audit source:** Product audit, Bans section; feature audit (`12_implementation-prd.md` §3.3, banned clients prevented from booking)

## Overview & Root Cause
Bans can be stored, but nothing enforces them:
- `ClientModel::isBanned()` is used only by the read-only ban-check resource.
- Client login, social login, token refresh and booking creation never consult bans.
- Barber bans (`BarberModel::bans()`) are never checked anywhere.

A banned user keeps full access to the platform.

## Evidence
- `backend/modules/Client/Models/ClientModel.php:72-75`: `isBanned()` uses `bans()->active()->exists()`.
- `backend/modules/Ban/Models/BanModel.php:56-61`: the `active` scope (`banned_from <= now` and `banned_until` null or in the future).
- `backend/modules/Ban/Http/Resources/Client/BanCheckResource.php:14`: the only consumer of `isBanned()`.
- `backend/modules/Client/Handlers/Client/LoginHandler.php:22-28`: password check, then success, with no ban check.
- `backend/modules/Booking/Eloquent/Resolvers/Client/CreateBookingEloquentResolver.php`: no ban check.
- `backend/modules/Barber/Models/BarberModel.php:58-61`: barber `bans()` exists.
- `backend/modules/Barber/Handlers/Barber/LoginHandler.php:22`: no ban check.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Add `isBanned()` to `BarberModel`, mirroring the client implementation.
- **Client:** reject with 403 (`ErrorCodeEnum::FORBIDDEN`) plus a distinguishing message or sub-code (for example `account_banned`) in:
  - `LoginHandler`
  - `SocialLoginHandler`
  - `RefreshTokenHandler`
  - `RegisterHandler`, when the email belongs to a banned account
- Add an `EnsureNotBanned` middleware on the `auth:client` and `auth:barber` groups, so existing tokens stop working once a ban is active.
- **Booking creation:** a banned client gets 403, and no booking row is created.
- **Barber:** reject `POST /api/v1/barber/login` and dashboard barber login (`backend/modules/Dashboard/Handlers/DashboardLoginHandler.php`) for banned barbers.
- When a ban is created, revoke the user's Sanctum tokens (listener on `BanModel` created).

### Dashboard (BFF / React)
- `frontend/dashboard/new/src/app/api/auth/login/route.ts`: surface the backend 403 ban message on the login form instead of a generic error.

### Mobile (Flutter / Repositories)
- `frontend/mobile/apps/client_app/lib/src/features/auth/auth_error.entity.dart`: map the ban error to a dedicated "account suspended" message, shown on login.
- `frontend/mobile/packages/core/lib/src/session/session.bloc.dart`: on a 403 ban response from any authenticated call, clear the session and route to login with that message.

## Acceptance Criteria
- [ ] A client with an active ban gets 403 from `POST /api/v1/client/login`, and no token is issued.
- [ ] An existing token of a newly banned client gets 403 on `GET /api/v1/bookings`.
- [ ] A banned client gets 403 from `POST /api/v1/bookings`, and the `bookings` row count is unchanged.
- [ ] A barber with an active ban gets 403 from `POST /api/v1/barber/login` and from dashboard barber login.
- [ ] An expired ban (`banned_until` in the past) does not block login.
- [ ] Feature tests in `tests/Feature/Ban/BanEnforcementTest.php` cover each case above.
- [ ] `php artisan test`, dashboard `npm run test` and `melos run test` pass; PHPStan (max) and Pint are clean for touched files.

## Out of Scope
- Hiding banned barbers and branches from Explore: Task 09.
- Removing the duplicate unrouted `CheckClientBanAction`: Task 66.
