# Task 48: Complete Branch and Barber Detail Payloads

**Phase:** Discovery · **Priority:** P1 · **Depends on:** Task 42, Task 55 · **Audit source:** Feature-spec audit — BE-03 (branch detail services); product-spec audit — Booking/Floor plan (`backend/docs/04_house-rules.md:24-25` B4/B5, `backend/docs/07_user-flows.md:42` Flow 2.2)

## Overview & Root Cause
Branch detail builds its service list only from services of barbers sitting at chairs, ignoring the brand/branch-owned service menu; a branch with no seated barbers shows no services. The floor plan returns the chair's barber without services, so tapping a chair cannot show "barber + services" or, for an empty chair, the shop menu. Barber detail returns only the barber's services and never says where the barber works (branch, chair, affiliations).

## Evidence
- `backend/modules/Explore/Eloquent/Resolvers/Shared/GetBranchDetailEloquentResolver.php:17-32` — loads `chairs.barber.services`; `services` = flatMap of barber services.
- `backend/modules/Explore/Eloquent/Resolvers/Shared/GetBarberDetailEloquentResolver.php:16-21` — `with('services')` only.
- `backend/modules/Branch/Eloquent/Resolvers/Shared/GetFloorPlanEloquentResolver.php:20` — eager-loads `chairs.barber` only; barber services are not loaded.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Branch detail `services` = active brand/branch-owned offered services ∪ seated barbers' services, each tagged with its owner (`brand` | `barber`) and only `active` ones.
- Floor plan chair payload: include the seated barber's active services; empty chairs reference the branch menu.
- Barber detail: add `workplaces` (accepted affiliations with branch id/name/chair label) and rating fields from Task 42.
### Decision
  - **Decision (best option, no product decision was open): one bookable-service rule and one shop-menu scope.** `OfferedServiceModel::scopeBookable()` (active, and free-text or an active catalog item — CAT-1/CAT-2) and `scopeOfferedAtShop()` (branch- or brand-owned) are shared by branch detail, the floor plan and barber detail, so the three menus cannot disagree. The old detail filter also dropped valid free-text services (it required an active catalog item); that is fixed by the same rule.

### Implemented contract
- Shared code path: `OfferedServiceModel::bookable()` / `offeredAtShop($branchId, $brandId)`, `Modules\OfferedService\Http\Resources\Shared\MenuServiceResource` (service payload + `owner`), used by `GetBranchDetailEloquentResolver`, `GetFloorPlanEloquentResolver` + `GetFloorPlanAction`, and `GetBarberDetailEloquentResolver`.
- Scope of the rule: branch detail `services` = bookable branch- and brand-owned services ∪ bookable services of seated, enabled, unbanned barbers, deduplicated; inactive services and services of inactive catalog items never appear. Barber `workplaces` = accepted affiliations only (pending/rejected/terminated excluded), with discoverable branches (and the chair label where the barber sits) or brands.
- Request: unchanged.
- Success: `GET explore/branches/{branch}` `services[]` items gain `owner` (`brand`|`branch`|`barber`). `GET branches/{branch}/floor-plan` chairs gain `barber.services[]` (bookable) and `services_source` (`barber`|`branch`), plus top-level `branch_services[]` (the shop menu for empty chairs). `GET explore/barbers/{barber}` gains `workplaces[]` (`type`, `id`, `name`, `chair_label`), bookable `services[]` with `owner`, and the Task 42 rating fields.
- Dashboard: none. Mobile: `core` `BookingServiceDto.owner`, `FloorChairBarberDto` (barber + services, replaces `BookingBarberDto` on `FloorChairDto`), `FloorChairDto.servicesSource`, `FloorPlanDto.branchServices`, `BarberWorkplaceDto` + `BarberProfileDto.workplaces`; `client_app` `ChairServices` panel under the floor plan (seated barber's services or the shop menu for the selected chair) and `StylistWorkplaces` on the stylist profile; en/ar copy; DTO and widget tests. Docs: this spec, `backend/docs/feature-index.md`.
- Deviations from the original spec text: none.

### Dashboard (BFF / React)
- None — client-facing payloads.
### Mobile (Flutter / Repositories)
- Update `packages/core/lib/src/network/dto/branch_detail.dto.dart`, `floor_chair.dto.dart` and `barber_profile.dto.dart` (+ regenerated `.g.dart`).
- `apps/client_app/lib/src/features/booking/widgets/branch_detail_body.widget.dart`: show chair services on tap and branch menu for empty chairs.
- `apps/client_app/lib/src/features/stylist/stylist_profile.screen.dart`: show workplaces.

## Acceptance Criteria
- [x] Branch with no seated barbers but 2 active brand services → `GET explore/branches/{branch}` returns those 2 services (Feature test).
- [x] Inactive services are never returned.
- [x] `GET branches/{branch}/floor-plan` chair objects include `barber.services` for seated barbers.
- [x] `GET explore/barbers/{barber}` includes `workplaces` listing accepted affiliations only.
- [x] Mobile DTO tests parse the new fields; widget test shows services after a chair tap.
- [x] `php artisan test` and `melos run test` pass; Pint clean (PHPStan skipped for this run on the user's instruction).

## Out of Scope
- Floor-plan canvas size and decorations (Task 74).
- Affiliation lifecycle — Task 55.
