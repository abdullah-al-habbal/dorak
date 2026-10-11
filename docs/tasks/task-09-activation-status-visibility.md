# Task 09: Enforce Account Status at Login and Hide Inactive Entities in Explore

**Phase:** 1 — Security & Authorization · **Priority:** P0 · **Depends on:** Task 08 (shares the ban checks) · **Audit source:** Feature audit BE-02/19 (client status never checked) and BE-09/12_impl (activation, ban and status not enforced in Explore)

## Overview & Root Cause
Clients, barbers and branches all have a `status` enum (`pending`, `enabled`, `disabled`).
- **Login:** client login and the mobile barber and branch logins ignore status. Only dashboard barber login checks it. Disabled or pending accounts can authenticate.
- **Explore:** the resolvers filter only by coordinates, radius and universe. Deactivated, pending or banned barbers and branches still appear in discovery and can be booked.

## Evidence
- `backend/modules/Client/Enums/ClientStatusEnum.php:9-11`: `Pending`, `Enabled`, `Disabled`.
- `backend/modules/Client/Handlers/Client/LoginHandler.php:22-28`: no status check.
- `backend/modules/Barber/Handlers/Barber/LoginHandler.php:22`: checks `has_login` and password only.
- `backend/modules/Branch/Handlers/Branch/LoginHandler.php`: returns `status` but does not gate on it.
- `backend/modules/Dashboard/Handlers/DashboardLoginHandler.php:68`: `if (! $barber->status->isEnabled())`, the correct pattern (dashboard only).
- `backend/modules/Explore/Eloquent/Resolvers/Shared/ExploreBranchesEloquentResolver.php:32-42` and `ExploreBarbersEloquentResolver.php:32-41`: no status or ban filter.
- `backend/modules/Barber/Models/BarberModel.php:89-92` and `backend/modules/Branch/Models/BranchModel.php:81-84`: `is_enabled` accessors exist but are unused in Explore.

## Full-Stack Scope
### Backend (API / DB / Policies)
- **Login gates (403 when status is not `enabled`):**
  - client `LoginHandler` and `SocialLoginHandler`;
  - barber `LoginHandler`;
  - branch `LoginHandler`.
  - Decision required: whether a `pending` client (email not yet verified) may log in with limited scope. If yes, document the allowed routes.
- **Explore:** add a reusable `discoverable()` scope on `BarberModel` and `BranchModel` (`status = enabled` and no active ban). Apply it in:
  - Explore branches and barbers (list and detail);
  - the floor plan;
  - `GET /api/v1/brands/{brand}` branch listings.
- **Explore detail:** `GET explore/branches/{id}` and `explore/barbers/{id}` return 404 for non-discoverable entities.
- **Booking creation:** reject a non-discoverable barber or a chair belonging to a non-discoverable branch (422).

### Dashboard (BFF / React)
- None. Dashboard login already gates barber status. Admin activation UI is Task 76.

### Mobile (Flutter / Repositories)
- `frontend/mobile/apps/client_app/lib/src/features/auth/auth_error.entity.dart`: map the status-based 403 to an "account not active" message.
- The stylist and business app logins (Tasks 82 and 84) must handle the same 403.

## Acceptance Criteria
- [ ] A client with `status=disabled` gets 403 from `POST /api/v1/client/login`.
- [ ] A barber with `status=disabled` gets 403 from `POST /api/v1/barber/login`; a disabled branch gets 403 from `POST /api/v1/branch/login`.
- [ ] `GET /api/v1/explore/branches` excludes a branch with `status=disabled` and a branch with an active ban.
- [ ] `GET /api/v1/explore/barbers` excludes disabled and banned barbers.
- [ ] `GET /api/v1/explore/branches/{disabledBranch}` returns 404.
- [ ] `POST /api/v1/bookings` targeting a disabled branch's chair returns 422.
- [ ] Feature tests `tests/Feature/Explore/DiscoverabilityTest.php` and `tests/Feature/Auth/AccountStatusLoginTest.php` cover the cases above.
- [ ] `php artisan test` passes; PHPStan (max) and Pint are clean for touched files.

## Out of Scope
- Branch activate/deactivate endpoints and owner-driven barber activation: Task 53.
- Ban enforcement at login and booking: Task 08.
