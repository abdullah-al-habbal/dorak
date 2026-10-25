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
- **Decision (D1, resolved): migrate every branch-owned `offered_services` row to its branch's parent brand, then remove `branch` from the allowed `serviceable_type` everywhere** (dashboard API, the Branch Filament panel's service resource, walk-in booking scoping, and the explore/ranking/recommendation service lookups, all of which previously read services directly off a branch). The migration is irreversible by design — see `docs/decisions-required.md` Task 54.
- `catalog_item_id` validation follows the Task 14 ID decision.

### Dashboard (BFF / React)
- `frontend/dashboard/src/services/api/dashboard/service-form.schema.ts`: add `atHome`, and remove the `branch` serviceable option.
- Barber workspace services section is in Task 69.

### Mobile (Flutter / Repositories)
- stylist_app: profile bio edit and "My services" CRUD (Task 83). Add the endpoints in `frontend/mobile/packages/core/lib/src/network/endpoints/operations.endpoints.dart` (or a new barber endpoints file) and `operations.repository.dart`.
- client_app: show bio on `frontend/mobile/apps/client_app/lib/src/features/stylist/stylist_profile.screen.dart`.

## Acceptance Criteria
- [x] `PATCH /api/v1/barber/profile` with `bio.en/ar` returns 200 and persists. `GET /api/v1/explore/barbers/{barber}` includes `bio`.
- [x] `POST /api/v1/barber/services` returns 201 with `serviceable_type=barber` and `serviceable_id` = the authenticated barber, regardless of payload.
- [x] `PUT /api/v1/barber/services/{id}` on another barber's service returns 403 (or 404) — implemented as 404 (not found), matching the existing `ShowServiceEloquentResolver` ownership-scoping pattern.
- [x] `POST /api/v1/dashboard/services` with `serviceable_type=branch` returns 422.
- [x] `at_home=true` persists via both the dashboard and barber endpoints.
- [x] `php artisan test`, `npm run test` and `melos run test` pass; Pint clean (PHPStan is exempted per `backend/CLAUDE.md`).

### Implemented contract
- Shared code path: `DashboardActor::canManageBrandServices()`, used by `StoreServiceAction`, `UpdateServiceAction`; `OfferedServiceModel::scopeOfferedAtShop()`, used by `GetBranchDetailEloquentResolver`, `GetFloorPlanAction`.
- Scope of the rule (D1): every `offered_services` row is owned by a Brand or a Barber, never a Branch. A branch manager may still create/update/delete services for their own branch's brand (`canManageBrandServices`); a brand owner, for any brand they own (`canManageBrand`); a platform admin, unrestricted.
- Request: `barbers.bio` (json, translatable) accepted via `PATCH /api/v1/barber/profile` as `bio.en`/`bio.ar`. New `BarberServiceRequest` (catalog_item_id, currency_id, name.en/ar, price, duration, active, at_home) backs `POST/GET /api/v1/barber/services` and `PUT/DELETE /api/v1/barber/services/{service}`; `serviceable_id`/`serviceable_type` are never read from the barber's payload — forced server-side to the authenticated barber.
- Failure: `PUT`/`DELETE` on another barber's service → 404 (`ModelNotFoundException`, scoped query). `POST /api/v1/dashboard/services` with `serviceable_type=branch` → 422 (`Rule::in(['brand', 'barber'])`). A branch manager creating/updating a service for another brand → 403.
- Success: `POST /api/v1/barber/services` → 201, `data.serviceable_type=barber`, `data.serviceable_id`=caller. Dashboard service endpoints now scope list/show/store/update by `scopedBrandIds()` instead of `scopedBranchIds()`.
- Dashboard: `service-form.schema.ts` (`serviceableType` enum narrowed to `brand`/`barber`), `entity-crud-field-options.util.ts`, `entity-crud-defaults.util.ts` (new `brandId` default), `dashboard-entities.schema.ts`, `dashboard-mapper.util.ts`, `walk-in-booking-form.tsx` (service picker now filters by the branch's brand). `AuthSession`/`BackendMeData` gained a singular `brandId` (`DashboardActor::brandId`) for this. Mobile: `packages/core` — `BarberProfileDto.bio`, `OperationsEndpoints`/`ApiEndpoints` barber-services routes, `StylistOperationsRepository.updateProfile/getServices/createService/updateService/deleteService` (UI lands in Task 83); `client_app` — `StylistProfileBody` renders `profile.bio` when present. Docs: this file, `docs/decisions-required.md`.
- Deviations from the original spec text: "403 (or 404)" for cross-barber access implemented as 404 only, per the existing ownership-scoping convention elsewhere in the codebase (no new Policy class introduced for this narrow case). D1's resolution required touching more than the two listed API surfaces — see the decision record for the full list (Branch Filament panel, walk-in booking scope, explore/ranking/recommendation service lookups) — because `branch`-owned services were read directly in several places beyond the Dashboard/Branch APIs the spec named.

## Out of Scope
- At-home booking rule enforcement (Task 25).
- Stylist app UI (Task 83), barber workspace UI (Task 69).
