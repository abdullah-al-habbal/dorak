# Task 42: Compute and Expose Branch and Barber Ratings

**Phase:** Discovery · **Priority:** P1 · **Depends on:** Task 39, Task 41 · **Audit source:** Product-spec audit — Discovery (`backend/docs/03_persona-journeys.md:16`, `backend/docs/06_entity-model-abstract.md:104`); feature-spec audit — Rec PRD US-04 (`rating_min` for barbers)

## Overview & Root Cause
Clients are meant to see ratings for shops and barbers, but branch and barber resources expose no rating fields and no aggregate is stored. The `rating_min` filter computes `avg(rating)` on the fly over all reviews, including disputed ones, and because reviews only ever have a branch subject (Task 39), barber `rating_min` filtering removes every barber.

## Evidence
- `backend/modules/Branch/Http/Resources/Shared/BranchResource.php:15-25` — no rating fields.
- `backend/modules/Barber/Http/Resources/BarberResource.php:15-29` — no rating fields.
- `backend/modules/Explore/Eloquent/Resolvers/Shared/ExploreBranchesEloquentResolver.php:131-134` and `ExploreBarbersEloquentResolver.php:127-130` — `avg(rating)` with no status filter.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Add `rating_avg` (decimal) and `rating_count` (int) to `branches` and `barbers`, maintained when a review is created, hidden, disputed or resolved (observer or domain listener).
- `rating_min` filters on the stored column; only `published`/`resolved` reviews count.
- Expose `rating_avg` and `rating_count` in `BranchResource`, `BarberResource`, branch detail and barber detail.
- Backfill command/migration step for existing reviews.
### Dashboard (BFF / React)
- Show rating on branch list/detail where branches are rendered (`frontend/dashboard/src/services/api/dashboard/ibranch.types.ts` + list columns).
### Mobile (Flutter / Repositories)
- Add `ratingAvg`, `ratingCount` to `packages/core/lib/src/network/dto/branch.dto.dart`, `branch_detail.dto.dart` and `barber_profile.dto.dart`; render on discovery cards and `apps/client_app/lib/src/features/stylist/stylist_profile.screen.dart`.

## Acceptance Criteria
- [ ] Creating a published review updates the subject's `rating_avg`/`rating_count` (Feature test).
- [ ] Disputing a review removes it from the aggregate; resolving restores it (Feature test).
- [ ] `GET explore/barbers?rating_min=4` returns barbers whose barber-subject reviews average ≥ 4 (no longer empty).
- [ ] `GET explore/branches` and `explore/branches/{branch}` responses include `rating_avg` and `rating_count`.
- [ ] `php artisan test`, `npm run test` and `melos run test` pass; PHPStan max + Pint clean.

## Out of Scope
- Composite ranking weights — Task 46.
