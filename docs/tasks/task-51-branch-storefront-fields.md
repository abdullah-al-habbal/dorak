# Task 51: Add Branch Storefront Fields and Opening Hours

**Phase:** Phase 8 — Brand, Branch & Barber Platform · **Priority:** P2 · **Depends on:** Task 12, Task 44 · **Audit source:** Product-spec audit (Branch/Brand); `backend/docs/01_vision-and-scope.md:74`, `backend/docs/06_entity-model-abstract.md:80-84`, `backend/docs/03_persona-journeys.md:36,54`

## Overview & Root Cause
The product promises a per-branch digital storefront: profile, hours, location, services and prices. The entity model requires a translatable description, a translatable address, opening/closing hours and a gender category. The `branches` table has only name, email, password, status and coordinates, so none of these fields exist. Managers also cannot "adjust today's hours" (persona journey).

## Evidence
- `backend/modules/Branch/Database/Migrations/0001_01_01_200011_create_branches_table.php:14-24` — columns: id, brand_id, name, email, password, status, latitude, longitude only.
- `frontend/dashboard/new/src/services/api/dashboard/branch-form.schema.ts:6-13` — the form has only name, brandId, email, password, lat/lng, status.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Migration: add `description` (json, translatable), `address` (json, translatable), and `tags` (json array or a pivot). Gender category is handled in Task 44.
- New table `branch_opening_hours` (branch_id, weekday 0–6, opens_at, closes_at, is_closed), plus `branch_hours_overrides` (branch_id, date, opens_at, closes_at, is_closed) for "today's hours".
- Extend `PATCH /api/v1/branch/profile` and `PUT /api/v1/dashboard/branches/{branch}` to accept these fields. Add `PUT /api/v1/branch/opening-hours` and `PUT /api/v1/branch/hours-overrides/{date}`.
- Expose fields and hours in `GET /api/v1/explore/branches/{branch}` and `GET /api/v1/branch/profile`.
- Task 22 consumes the hours for booking validation.

### Dashboard (BFF / React)
- `frontend/dashboard/new/src/services/api/dashboard/branch-form.schema.ts` and `frontend/dashboard/new/src/services/api/dashboard/ibranch.types.ts`: add the new fields.
- Add an opening-hours editor to the branch form. The branch-scoped BFF routes are added in Task 74.

### Mobile (Flutter / Repositories)
- client_app: `frontend/mobile/apps/client_app/lib/src/features/booking/widgets/branch_detail_body.widget.dart` should render description, address and today's hours. Extend the branch detail DTO in `frontend/mobile/packages/core/lib/src/network/repositories/explore.repository.dart`.
- business_app: hours editing UI is in Task 85.

## Acceptance Criteria
- [ ] Migrations run up and down cleanly on the test DB.
- [ ] `PATCH /api/v1/branch/profile` with `description.en/ar` and `address.en/ar` returns 200 and persists both locales.
- [ ] `PUT /api/v1/branch/opening-hours` with 7 entries returns 200. `closes_at <= opens_at` returns 422.
- [ ] A same-day override is returned as `today_hours` in `GET /api/v1/explore/branches/{branch}`.
- [ ] A branch user cannot edit another branch's hours (403 test).
- [ ] Dashboard form schema test covers the new fields (`npm run test` passes).
- [ ] client_app widget test asserts that the address and today's hours render.
- [ ] `php artisan test` passes; PHPStan max + Pint clean.

## Out of Scope
- Booking validation against hours (Task 22).
- Gender category / unisex (Task 44).
- Business app hours UI (Task 85).
