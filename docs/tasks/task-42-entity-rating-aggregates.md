# Task 42: Compute and Expose Branch and Barber Ratings

**Phase:** Discovery · **Priority:** P1 · **Depends on:** Task 39, Task 41 · **Audit source:** Product-spec audit — Discovery (`backend/docs/03_persona-journeys.md:16`, `backend/docs/06_entity-model-abstract.md:104`); feature-spec audit — Rec PRD US-04 (`rating_min` for barbers)

## Overview & Root Cause
Clients are meant to see ratings for shops and barbers, but branch and barber resources expose no rating fields and no aggregate is stored. The `rating_min` filter computes `avg(rating)` on the fly over all reviews, including disputed ones, and because reviews only ever have a branch subject (Task 39), barber `rating_min` filtering removes every barber. Note (Task 39): barber-subject reviews now exist for every completed booking with a barber (chair, in-shop and at-home).

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
### Decision
  - **Decision (best option, no product decision was open): stored aggregates maintained by one observer.** `rating_avg` (decimal 3,2, indexed) and `rating_count` live on `branches` and `barbers`; `Modules\Review\Services\SubjectRatingRefresher` recomputes a subject from its `published`/`resolved` reviews, called by `ReviewRatingObserver` (create, rating/status/subject change, delete) and explicitly after the dispute auto-release bulk update. Recomputing (rather than incremental +/-) cannot drift and is cheap per subject. Rejected: computing `avg()` per query (slow, and it is what made `rating_min` wrong).

### Implemented contract
- Shared code path: `SubjectRatingRefresher::refresh()/refreshAll()`, `ReviewRatingObserver`, `reviews:refresh-ratings` (manual full recompute), `ReleaseExpiredReviewDisputesCommand` (refreshes the subjects it releases). Migrations `2026_10_22_000002_add_rating_aggregates_to_{branches,barbers}_table` add the columns and backfill them with correlated subqueries.
- Scope of the rule: only `published` and `resolved` reviews count; `disputed` and `hidden` never do. Unrated subjects have `rating_avg = null`, `rating_count = 0`. Client-subject reviews (Task 40) are not aggregated here.
- Request: unchanged; `rating_min` on `explore/branches` and `explore/barbers` now filters `rating_avg >= rating_min` (unrated subjects are excluded when the filter is set).
- Success: `BranchResource` and `BarberResource` (lists, `explore/branches/{branch}`, `explore/barbers/{barber}`, dashboard branch list, booking barber payloads) expose `rating_avg` (float|null, 2 decimals) and `rating_count` (int).
- Dashboard: `IBranch.ratingAvg/ratingCount`, mapper, "Rating" branch list column (en/ar), Vitest. Mobile: `BranchDto`, `BranchDetailDto`, `BarberProfileDto` gain `ratingAvg`/`ratingCount`; `client_app` shows `RatingLabel` ("★ 4.3 (3 reviews)" / "No reviews yet", en/ar plural) on discovery cards, the branch detail header and the stylist profile header. Docs: this spec, `backend/docs/feature-index.md`.
- Deviations from the original spec text: none. Fixed in passing: mobile `BranchDto`/`BranchDetailDto` typed `id` and `brand_id` as `int` while the API returns UUID strings, so real explore responses could not be parsed; both are now `String` (fixtures updated).

### Dashboard (BFF / React)
- Show rating on branch list/detail where branches are rendered (`frontend/dashboard/src/services/api/dashboard/ibranch.types.ts` + list columns).
### Mobile (Flutter / Repositories)
- Add `ratingAvg`, `ratingCount` to `packages/core/lib/src/network/dto/branch.dto.dart`, `branch_detail.dto.dart` and `barber_profile.dto.dart`; render on discovery cards and `apps/client_app/lib/src/features/stylist/stylist_profile.screen.dart`.

## Acceptance Criteria
- [x] Creating a published review updates the subject's `rating_avg`/`rating_count` (Feature test).
- [x] Disputing a review removes it from the aggregate; resolving restores it (Feature test).
- [x] `GET explore/barbers?rating_min=4` returns barbers whose barber-subject reviews average ≥ 4 (no longer empty).
- [x] `GET explore/branches` and `explore/branches/{branch}` responses include `rating_avg` and `rating_count`.
- [x] `php artisan test`, `npm run test` and `melos run test` pass; Pint clean (PHPStan skipped for this run on the user's instruction).

## Out of Scope
- Composite ranking weights — Task 46.

> Note (Task 41): `rating_min` already counts only `published` reviews and compares numerically on MySQL and SQLite; aggregates should use the same rule.
