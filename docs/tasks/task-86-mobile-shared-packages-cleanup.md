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
- **Decision (T86-1, resolved): delete the package (option b).** Chosen by the product owner; recommended because Task 85 shipped a preset-only floor-plan screen and the repo rule keeps application code out of shared mobile packages.
- Delete `endpoints.barrel.dart`, or make it complete and route `network.barrel.dart` through it. Keep exactly one export path for endpoints.

## Acceptance Criteria
- [x] Either `feature_floor_plan` contains the floor-plan widgets with tests and is a dependency of `client_app` (and `business_app` if used), or the directory and its workspace entry are removed.
- [x] Exactly one barrel exports all 15 endpoint files, verified by a test or script that compares the barrel exports against the `endpoints/` directory listing.
- [x] `melos run bootstrap`, `melos run analyze` and `melos run test` pass.

### Implemented contract
- Removed `frontend/mobile/packages/feature_floor_plan` and its `workspace:` entry; updated README, `docs/INDEX.md`, mobile `CLAUDE.md`, core/localization guides, `references/dependency-layering.md` and `docs/feature-index.md`.
- The existing `endpoints.barrel.dart` was already complete for the current 20 endpoint files (the spec's "15" and "4 of 15" are stale); it is now the single export path: `network.barrel.dart` exports only the barrel instead of 20 duplicate lines.
- `packages/core/test/endpoints_barrel_test.dart` compares the barrel exports with the `endpoints/` directory listing and asserts `network.barrel.dart` reaches endpoints only through the barrel.
- Backend and dashboard: unchanged.

## Out of Scope
- New floor-plan features (Task 85 configuration screen; Task 20 availability semantics).
