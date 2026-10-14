# Task 17: Backfill Feature Tests for Uncovered Routes

**Phase:** 2 — Data Integrity & Broken Pipelines · **Priority:** P0 · **Depends on:** Tasks 03 and 04 (their routes are tested there) · **Audit source:** Backend route audit, 16 NoTest routes (152 routes in total, 126 fully covered)

## Overview & Root Cause
Sixteen API routes have no HTTP feature test. Phases 3–8 refactor the booking engine, notifications and authorization, so these routes need a safety net before that work starts. Two of the sixteen (`PUT` and `DELETE /service-catalog/items/{id}`) are covered by Task 04. This task covers the remaining 14.

## Evidence
Uncovered routes and their action classes (all verified to exist):
- `GET /api/v1/barber/appointments/today`: `backend/modules/Barber/Http/Actions/Barber/TodayAppointmentsAction.php`
- `PATCH /api/v1/barber/workstation-status`: `backend/modules/Barber/Http/Actions/Barber/UpdateWorkstationStatusAction.php`
- `POST /api/v1/branch/barbers`: `backend/modules/Branch/Http/Actions/Branch/CreateManagedBarberAction.php`
- `PATCH /api/v1/branch/bookings/{booking}/status`: `backend/modules/Branch/Http/Actions/Branch/UpdateBookingStatusAction.php`
- `GET /api/v1/branch/chairs`: `backend/modules/Branch/Http/Actions/Branch/ListBranchChairsAction.php`
- `PATCH /api/v1/branch/floor-plan`: `backend/modules/Branch/Http/Actions/Branch/UpdateFloorPlanConfigurationAction.php`
- `POST /api/v1/dashboard/bookings/walk-in`: `backend/modules/Dashboard/Http/Actions/CreateWalkInBookingAction.php`
- `PATCH /api/v1/dashboard/bookings/{booking}`: `backend/modules/Dashboard/Http/Actions/UpdateBookingStatusAction.php`
- `PUT /api/v1/dashboard/branches/{branch}`: `backend/modules/Dashboard/Http/Actions/Branches/UpdateBranchAction.php`
- `POST /api/v1/dashboard/chairs`: `backend/modules/Dashboard/Http/Actions/Chairs/StoreChairAction.php`
- `GET /api/v1/dashboard/profile`: `backend/modules/Dashboard/Http/Actions/Profile/GetProfileAction.php`
- `GET /api/v1/service-catalog/items/{id}`: `backend/modules/ServiceCatalog/Http/Actions/Shared/ShowCatalogItemAction.php`
- `GET /api/v1/health`: `backend/modules/Core/Http/Actions/Shared/HealthCheckAction.php` (has only a unit test, `tests/Unit/Core/Http/Actions/HealthCheck/HealthCheckActionTest.php`)
- `GET|POST /api/v1/broadcasting/auth`: framework broadcaster registered in `backend/modules/Core/Providers/ApplicationServiceProvider.php`

## Full-Stack Scope
### Backend (API / DB / Policies)
- For each route above, add feature tests asserting:
  - the success status code and the `ApiResponseBodyValueObject` envelope;
  - 401 without authentication (where guarded);
  - 403 or 404 for a foreign tenant (another branch's booking or chair, or another barber);
  - 422 for invalid payloads on write routes;
  - DB state after write routes.
- Place them in the existing folders: `tests/Feature/Barber/Http/`, `tests/Feature/Branch/Http/`, `tests/Feature/Dashboard/` (extend `BookingApiTest`, `BranchApiTest`, `ChairApiTest` and `DashboardProfileApiTest`), `tests/Feature/ServiceCatalog/Http/` and `tests/Feature/Core/`.
- `broadcasting/auth`: assert that a barber can authorize `private-barber.{ownId}` and gets 403 for another barber's channel; same for branch channels.
- Record current behaviour faithfully. Where the behaviour is a known defect fixed by a later task (for example the branch status update skipping transition rules, Task 18), mark that test `@group known-defect` and reference the task, rather than asserting the wrong behaviour as correct.

### Dashboard (BFF / React)
- None.

### Mobile (Flutter / Repositories)
- None.

## Acceptance Criteria
- [x] Each of the 14 routes above is hit by at least one feature test (grep for the URI or route name in `backend/tests/Feature/` finds a match).
- [x] Every guarded route has a 401 test, and every tenant-scoped route has a cross-tenant 403 or 404 test.
- [x] `broadcasting/auth` has allow and deny tests for the barber and branch channels.
- [x] Route coverage was checked against all 14 listed routes; this repository does not contain a standalone route-to-test audit script. All listed URIs are represented in `backend/tests/Feature/Task17UncoveredRoutesTest.php`.
- [x] The full Pest suite passes (677 tests, 2,971 assertions); focused PHPStan (max) and Pint checks are clean for the touched production and test files.

## Out of Scope
- Fixing the behaviours these tests reveal: Tasks 18, 26 and others.
- Service catalog mutation tests: Task 04.
