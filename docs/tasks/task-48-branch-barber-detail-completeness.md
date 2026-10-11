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
### Dashboard (BFF / React)
- None — client-facing payloads.
### Mobile (Flutter / Repositories)
- Update `packages/core/lib/src/network/dto/branch_detail.dto.dart`, `floor_chair.dto.dart` and `barber_profile.dto.dart` (+ regenerated `.g.dart`).
- `apps/client_app/lib/src/features/booking/widgets/branch_detail_body.widget.dart`: show chair services on tap and branch menu for empty chairs.
- `apps/client_app/lib/src/features/stylist/stylist_profile.screen.dart`: show workplaces.

## Acceptance Criteria
- [ ] Branch with no seated barbers but 2 active brand services → `GET explore/branches/{branch}` returns those 2 services (Feature test).
- [ ] Inactive services are never returned.
- [ ] `GET branches/{branch}/floor-plan` chair objects include `barber.services` for seated barbers.
- [ ] `GET explore/barbers/{barber}` includes `workplaces` listing accepted affiliations only.
- [ ] Mobile DTO tests parse the new fields; widget test shows services after a chair tap.
- [ ] `php artisan test` and `melos run test` pass; PHPStan max + Pint clean.

## Out of Scope
- Floor-plan canvas size and decorations (Task 74).
- Affiliation lifecycle — Task 55.
