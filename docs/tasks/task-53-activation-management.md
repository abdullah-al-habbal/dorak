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
- Add `POST /api/v1/admin/branches/{branch}/activate|deactivate` (auth:admin_api), writing `activation_logs` like the barber path.
- Add a branch-owner path `POST /api/v1/branch/barbers/{barber}/activate|deactivate` (auth:branch_api). The policy must require an accepted affiliation between the barber and the branch (or the branch's brand); otherwise return 403.
- Decision required: whether a barber's self-deactivation should remain (the spec text implies the owner controls activation). Keep the current behavior until decided. Note (Task 37): the self activate/deactivate routes now use `EnsureBarberAccountAccess:approved`, so a `pending` (self-registered, awaiting approval) barber cannot activate themselves; every other barber route requires `enabled`.
- Deactivating a branch must not delete bookings. Decision required: whether future bookings are auto-cancelled (and notified via Task 28) or kept.

### Dashboard (BFF / React)
- Admin: the activate/deactivate branch and barber buttons belong to Task 76; this task only provides the API.
- Manager: add an activate/deactivate action on the stylists list (`frontend/dashboard/src/components/entities/`), routed through the Task 75 BFF.

### Mobile (Flutter / Repositories)
- business_app: barber activation toggle (Task 85). Add `activateBarber`/`deactivateBarber` to `frontend/mobile/packages/core/lib/src/network/repositories/managed_barber.repository.dart`.

## Acceptance Criteria
- [ ] `POST /api/v1/admin/branches/{branch}/deactivate` with an admin_api token returns 200, the branch status becomes disabled, and one `activation_logs` row is written.
- [ ] The same route without a token returns 401, and with a barber token returns 401/403.
- [ ] `POST /api/v1/branch/barbers/{barber}/deactivate` for a barber affiliated (accepted) with the branch returns 200. For an unaffiliated barber it returns 403.
- [ ] After deactivation, the entity is absent from `GET /api/v1/explore/branches` / `explore/barbers` (relies on the Task 09 filter; regression test).
- [ ] `php artisan test` passes; PHPStan max + Pint clean.

## Out of Scope
- Explore/login status enforcement itself (Task 09).
- Admin UI (Task 76), business_app UI (Task 85).
