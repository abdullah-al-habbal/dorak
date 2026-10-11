# Task 44: Support Unisex Universe and Barber Universe Filter

**Phase:** Discovery · **Priority:** P1 · **Depends on:** Task 49 · **Audit source:** Product-spec audit — Discovery (`backend/docs/04_house-rules.md:14` A5, `:108-109` J5, `backend/docs/08_edge-cases.md:67` EC-12); feature-spec audit — BE-03 (`universe` required vs optional)

## Overview & Root Cause
House rules require unisex venues to appear in both the men and women universes, and the universe filter to apply to barbers too. The universe enum only has `men` and `women`, branch search matches `brands.universe` exactly, and the barber explore endpoint has no universe parameter. BE-03 says `universe` is optional while the code makes it required. Women's and unisex venues are therefore under-served or invisible.

## Evidence
- `backend/modules/Client/Enums/UniverseEnum.php` — cases `Men`, `Women` only.
- `backend/modules/Explore/Eloquent/Resolvers/Shared/ExploreBranchesEloquentResolver.php:37` — `whereHas('brand', fn ($q) => $q->where('universe', $payload->universe))`.
- `backend/modules/Explore/Http/Requests/Shared/ExploreBranchesRequest.php:20` — `'universe' => ['required', …]`.
- `backend/modules/Explore/Http/Requests/Shared/ExploreBarbersRequest.php:15-26` — no `universe`.
- `backend/modules/Brand/Database/Migrations/0001_01_01_200010_create_brands_table.php:21` — `universe` default `'men'`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Add a venue-level universe enum including `unisex` (keep the client preference enum as men/women).
- Branch search: `universe=men` matches `men` + `unisex`; same for `women`.
- Decision required: universe stays on the brand or moves to the branch (A5 says branch); also whether `universe` becomes optional per BE-03 (default to the client's `preferred_universe`).
- Add `universe` to barbers (column or derived from affiliations) and to `ExploreBarbersRequest`.
### Dashboard (BFF / React)
- Expose universe (including `unisex`) in brand/branch forms (`frontend/dashboard/src/services/api/dashboard/branch-form.schema.ts` if moved to branch; brand form via Task 77).
### Mobile (Flutter / Repositories)
- `apps/client_app/lib/src/features/discovery/discovery_filter.entity.dart`: pass universe to barber discovery too (Task 79 uses it).

## Acceptance Criteria
- [ ] A `unisex` branch is returned for both `universe=men` and `universe=women` (Feature test).
- [ ] A `men` branch is not returned for `universe=women`.
- [ ] `GET explore/barbers?universe=women` filters barbers; invalid value → 422.
- [ ] Behaviour when `universe` is omitted matches the recorded decision and is covered by a test.
- [ ] `php artisan test` passes; PHPStan max + Pint clean.

## Out of Scope
- Setting universe through the brand API — Task 49.
