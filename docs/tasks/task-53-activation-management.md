# Task 53: Complete Activation Management

**Phase:** Phase 8 — Brand, Branch & Barber Platform · **Priority:** P2 · **Depends on:** Task 03, Task 09, Task 38 · **Audit source:** Feature-spec audit (BE-09, 15_post_launch Step 14); backend route audit

## Overview & Root Cause
Activation exists only for barbers. Admins can activate or deactivate a barber through `admin_api`, and a barber can activate or deactivate only themselves. There is no branch activation (BE-09), and brand owners or branch managers cannot activate or deactivate barbers working at their shop (15_post_launch Step 14). Task 09 makes Explore and login honor activation status; this task completes who can change it.

## Evidence
- `backend/modules/Activation/Routes/Api/V1/` — two route files: `admin/barbers/{barber}/activate|deactivate` (auth:admin_api) and `barbers/{barber}/activate|deactivate` (auth:barber). No branch routes.
- `backend/modules/Activation/Http/Actions/Barber/ActivateBarberAction.php:29-32` — forbids unless the authenticated barber id equals `{barber}` (self only).
- `backend/modules/Activation/Http/Actions/Business/ActivateAction.php` — admin barber activation.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Added `POST /api/v1/admin/branches/{branch}/activate|deactivate` (auth:admin_api), writing `activation_logs` like the barber path. Generalized `ToggleActivationCommand`/`ToggleActivationEloquentResolver` to resolve any morph-mapped activable (`barber`, `branch`) instead of hardcoding `BarberModel`.
- Added a branch-owner path `POST /api/v1/branch/barbers/{barber}/activate|deactivate` (auth:branch_api). Authorized via a new `BranchBarberActivationPolicy` (`Gate::policy(BarberModel::class, ...)`), backed by a new `Modules\Barber\Services\BarberBranchMembership` service (barber is `managed_by_branch_id` of the branch, or has an accepted `BarberAffiliationModel` with the branch or its brand). The existing `BarberBelongsToBranch` validation rule was refactored to reuse the same service instead of duplicating the query.
- Decision resolved (default, [PENDINGHUMANREVIEW]): self activate/deactivate (`barbers/{barber}/activate|deactivate`, `EnsureBarberAccountAccess:approved`) is unchanged — still self-only. See `docs/decisions-required.md`.
- Decision resolved (default, [PENDINGHUMANREVIEW]): deactivating a branch does not touch its bookings (no auto-cancel). See `docs/decisions-required.md`.

### Dashboard (BFF / React)
- Admin: the activate/deactivate branch and barber buttons belong to Task 76; this task only provides the API.
- Manager: added `PATCH /api/v1/dashboard/stylists/{stylist}/activate|deactivate` (`ActivateStylistAction`/`DeactivateStylistAction` in the backend `Dashboard` module, scoped exactly like `ShowStylistAction`/`UpdateStylistAction`), allowlisted in `dashboard-path.util.ts`, and a `StylistActivationToggle` button wired into `entity-list-page.tsx` for the `stylists` resource (`frontend/dashboard/src/components/entities/stylist-activation-toggle.tsx`). [NOTE] Task 75 (Branch People BFF) does not exist yet; this reuses the existing Dashboard `stylists` module/BFF proxy rather than waiting on it, since that module already has full stylist scoping.

### Mobile (Flutter / Repositories)
- business_app: added `activateBarber`/`deactivateBarber` to `frontend/mobile/packages/core/lib/src/network/repositories/managed_barber.repository.dart`, backed by a new `ActivationLogDto` and `BranchEndpoints.activateBarber|deactivateBarber`. Business_app UI wiring stays out of scope (Task 85).

## Acceptance Criteria
- [x] `POST /api/v1/admin/branches/{branch}/deactivate` with an admin_api token returns 201 (API convention: activation writes return `created`, matching the existing barber actions), the branch status becomes disabled, and one `activation_logs` row is written.
- [x] The same route without a token returns 401, and with a barber token returns 401/403.
- [x] `POST /api/v1/branch/barbers/{barber}/deactivate` for a barber affiliated (accepted) with the branch returns 200/201. For an unaffiliated barber it returns 403.
- [x] After deactivation, the entity is absent from `GET /api/v1/explore/branches` / `explore/barbers` (relies on the Task 09 filter; regression test added).
- [x] `php artisan test` passes; Pint clean. (PHPStan is exempted repo-wide per `backend/CLAUDE.md`.)

## Out of Scope
- Explore/login status enforcement itself (Task 09).
- Admin UI (Task 76), business_app UI (Task 85).
- Task 75's dedicated Branch People BFF (the manager stylists activation action reuses the existing Dashboard stylists module instead).
