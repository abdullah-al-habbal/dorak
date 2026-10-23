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
  - **Decision (resolved, best option): branch-level universe; optional filter defaulting to the client's preference.** A5 and the entity model put the gender category on the branch, so one brand can run men's, women's and unisex branches; BE-03 makes `universe` optional and a client's saved preference is the natural default, while guests see everything.
- Add `universe` to barbers (column or derived from affiliations) and to `ExploreBarbersRequest`.
### Implemented contract
- Shared code path: `Modules\Core\Enums\VenueUniverse::servingClient()` (men→men+unisex, women→women+unisex) and `Modules\Explore\Support\ExploreUniverse::resolve()` (explicit → `preferred_universe` via the `client` guard → null), used by `ExploreBranchesEloquentResolver` and `ExploreBarbersEloquentResolver`. `BranchModel::creating` inherits the brand universe (or `unisex`) when none is given.
- Scope of the rule: branches filter on `branches.universe`, barbers on `barbers.universe`; a null resolved universe applies no universe filter. Migrations `2026_10_23_000001_add_universe_to_{branches,barbers}_table` (branch rows backfilled from the brand; barbers default `unisex`).
- Request: `GET explore/branches` and `GET explore/barbers`: `universe` optional (`men`|`women`). `PUT/POST dashboard/branches`: optional `universe` (`men`|`women`|`unisex`). `PATCH barber/profile`: optional `universe`.
- Failure: any other `universe` value → 422 validation error on both explore endpoints.
- Success: `BranchResource` and `BarberResource` expose `universe`.
- Dashboard: branch form "Clientele" select (men/women/unisex, default unisex), schema, payload mapper, `IBranch.universe`, en/ar copy, Vitest. Mobile: `BranchDto`, `BranchDetailDto`, `BarberProfileDto` gain `universe`; the client discovery filter already sends `universe`; barber discovery in the app is Task 79 (it can now pass `universe`). Docs: this spec, `docs/decisions-required.md`, `backend/docs/feature-index.md`.
- Deviations from the original spec text: `brands.universe` is kept (not dropped) as the default for new branches; Task 49 can extend it to `unisex`.

### Dashboard (BFF / React)
- Expose universe (including `unisex`) in brand/branch forms (`frontend/dashboard/src/services/api/dashboard/branch-form.schema.ts` if moved to branch; brand form via Task 77).
### Mobile (Flutter / Repositories)
- `apps/client_app/lib/src/features/discovery/discovery_filter.entity.dart`: pass universe to barber discovery too (Task 79 uses it).

## Acceptance Criteria
- [x] A `unisex` branch is returned for both `universe=men` and `universe=women` (Feature test).
- [x] A `men` branch is not returned for `universe=women`.
- [x] `GET explore/barbers?universe=women` filters barbers; invalid value → 422.
- [x] Behaviour when `universe` is omitted matches the recorded decision and is covered by a test.
- [x] `php artisan test` passes; Pint clean (PHPStan skipped for this run on the user's instruction).

## Out of Scope
- Setting universe through the brand API — Task 49.
