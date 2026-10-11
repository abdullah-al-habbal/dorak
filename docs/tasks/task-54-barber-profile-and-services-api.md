# Task 54: Add Barber Bio and Self-Service Services API

**Phase:** Phase 8 — Brand, Branch & Barber Platform · **Priority:** P2 · **Depends on:** Task 14, Task 23 · **Audit source:** Product-spec audit (Barber, Booking); `backend/docs/06_entity-model-abstract.md:101`, `backend/docs/04_house-rules.md:44` (D1), `backend/docs/02_prd.md:55`

## Overview & Root Cause
The entity model gives barbers a translatable bio, but the barbers table has no `bio` column. Barbers cannot manage their own services through the API: the only path is the Filament barber panel, because `DashboardOperationsAuthorizationMiddleware` blocks barbers from dashboard operations. The `at_home` flag on offered services exists in the DB but cannot be set through the dashboard service API. That API also lets a service be owned by a `branch`, which contradicts D1 ("owned by either a Brand or a Barber").

## Evidence
- `backend/modules/Barber/Database/Migrations/` — no migration adds `bio`.
- `backend/modules/Dashboard/Http/Middleware/DashboardOperationsAuthorizationMiddleware.php:22` — throws "This dashboard operation is not available to barbers."
- `backend/modules/OfferedService/Database/Migrations/0001_01_01_200040_create_offered_services_table.php:23` — `at_home` boolean exists.
- `backend/modules/Dashboard/Http/Requests/ServiceRequest.php:14` — no `at_home` rule; `serviceable_type` allows `branch`.
- `backend/modules/OfferedService/Routes/Api/V1/services.php` — only `GET /barbers/{barber}/services`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Migration: `barbers.bio` (json, translatable). Accept it in `PATCH /api/v1/barber/profile` and expose it in barber resources (barber profile, explore barber detail).
- New barber-scoped CRUD: `GET/POST /api/v1/barber/services`, `PUT/DELETE /api/v1/barber/services/{service}` (auth:barber). `serviceable` is forced to the authenticated barber; other barbers' services return 403/404.
- Add `at_home` (boolean) to `Dashboard/Http/Requests/ServiceRequest.php` and the barber service request. Task 25 enforces at-home only for freelancers.
- D1: remove `branch` from the allowed `serviceable_type`. Decision required: migrate any existing branch-owned `offered_services` rows to the parent brand, or block the change until data is cleaned up.
- `catalog_item_id` validation follows the Task 14 ID decision.

### Dashboard (BFF / React)
- `frontend/dashboard/src/services/api/dashboard/service-form.schema.ts`: add `atHome`, and remove the `branch` serviceable option.
- Barber workspace services section is in Task 69.

### Mobile (Flutter / Repositories)
- stylist_app: profile bio edit and "My services" CRUD (Task 83). Add the endpoints in `frontend/mobile/packages/core/lib/src/network/endpoints/operations.endpoints.dart` (or a new barber endpoints file) and `operations.repository.dart`.
- client_app: show bio on `frontend/mobile/apps/client_app/lib/src/features/stylist/stylist_profile.screen.dart`.

## Acceptance Criteria
- [ ] `PATCH /api/v1/barber/profile` with `bio.en/ar` returns 200 and persists. `GET /api/v1/explore/barbers/{barber}` includes `bio`.
- [ ] `POST /api/v1/barber/services` returns 201 with `serviceable_type=barber` and `serviceable_id` = the authenticated barber, regardless of payload.
- [ ] `PUT /api/v1/barber/services/{id}` on another barber's service returns 403 (or 404).
- [ ] `POST /api/v1/dashboard/services` with `serviceable_type=branch` returns 422.
- [ ] `at_home=true` persists via both the dashboard and barber endpoints.
- [ ] `php artisan test`, `npm run test` and `melos run test` pass; PHPStan max + Pint clean.

## Out of Scope
- At-home booking rule enforcement (Task 25).
- Stylist app UI (Task 83), barber workspace UI (Task 69).
