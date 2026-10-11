# Task 86: Clean Up Shared Mobile Packages

**Phase:** Phase 14 — Mobile · **Priority:** P3 · **Depends on:** Task 85 (floor-plan configuration consumer, if the package is kept) · **Audit source:** Mobile audit — "Floor-plan package: Stub", "Endpoints barrel: incomplete / unused"

## Overview & Root Cause
Two shared-package artifacts mislead contributors:
- **`packages/feature_floor_plan` is empty.** Its library file is 1 byte, there are no Dart sources, and no app depends on it. The client floor-plan widgets live inside `client_app` instead.
- **`endpoints.barrel.dart` is incomplete and unused.** It exports 4 of the 15 endpoint files, and nothing imports it. `network.barrel.dart` is the real export surface.

## Evidence
- `frontend/mobile/packages/feature_floor_plan/lib/feature_floor_plan.dart` — 1 byte; the package has no `lib/src`.
- `frontend/mobile/apps/*/pubspec.yaml` — no app depends on `feature_floor_plan` (grep).
- `frontend/mobile/pubspec.yaml` — `packages/feature_floor_plan` is listed in `workspace:`.
- `frontend/mobile/apps/client_app/lib/src/features/booking/widgets/floor_plan_grid.widget.dart`, `floor_plan_zone_grid.widget.dart`, `floor_plan_legend_dot.widget.dart` — the actual floor-plan UI.
- `frontend/mobile/packages/core/lib/src/network/endpoints/endpoints.barrel.dart` — exports only `app`, `auth`, `client_interaction` and `job_posting` endpoints; not imported anywhere.
- `frontend/mobile/packages/core/lib/src/network/network.barrel.dart` — the complete export surface.

## Full-Stack Scope
### Backend (API / DB / Policies)
- None.

### Dashboard (BFF / React)
- None.

### Mobile (Flutter / Repositories)
- **Decision required:** either (a) move the floor-plan widgets from `client_app` into `feature_floor_plan` so `business_app` can reuse them for floor-plan configuration (Task 85), or (b) delete the package and remove it from the `workspace:` list. Do not leave it empty.
- Delete `endpoints.barrel.dart`, or make it complete and route `network.barrel.dart` through it. Keep exactly one export path for endpoints.

## Acceptance Criteria
- [ ] Either `feature_floor_plan` contains the floor-plan widgets with tests and is a dependency of `client_app` (and `business_app` if used), or the directory and its workspace entry are removed.
- [ ] Exactly one barrel exports all 15 endpoint files, verified by a test or script that compares the barrel exports against the `endpoints/` directory listing.
- [ ] `melos run bootstrap`, `melos run analyze` and `melos run test` pass.

## Out of Scope
- New floor-plan features (Task 85 configuration screen; Task 20 availability semantics).
