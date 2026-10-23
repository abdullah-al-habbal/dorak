# Task 46: Apply Composite Ranking Before Pagination

**Phase:** Discovery · **Priority:** P1 · **Depends on:** Task 42 · **Audit source:** Feature-spec audit — BE-17 / Recommendation PRD §3, §5, §6; product-spec audit — REC-2 (`backend/docs/02_prd.md:282`)

## Overview & Root Cause
The recommendation PRD orders explore results by a composite score and then paginates. The resolvers order by distance, paginate, and only then re-score and sort the current page, so a highly compatible branch on page 2 never reaches page 1. When a client has no preference vector the α weight is not redistributed, so those clients lose 0.4 of the score. `face_shape_compatible` only boosts ranking (γ); it never filters and does not default to the client's own face analysis.

## Evidence
- `backend/modules/Explore/Eloquent/Resolvers/Shared/ExploreBranchesEloquentResolver.php:43-45` — `orderBy('distance')` then `paginate()`.
- `backend/modules/Explore/Eloquent/Resolvers/Shared/ExploreBranchesEloquentResolver.php:81-100` — score computed and sorted on `$paginator->getCollection()` only.
- `backend/modules/Explore/Eloquent/Resolvers/Shared/ExploreBranchesEloquentResolver.php:69-72` — face-shape match used only as a boost set.
- `backend/modules/ClientRecommendation/Services/ExploreRankingWeightsResolver.php:14` — `resolveFor()` returns fixed weights; no α redistribution path.
- Same pattern in `backend/modules/Explore/Eloquent/Resolvers/Shared/ExploreBarbersEloquentResolver.php`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Score the full candidate set inside the radius (bounded, e.g. capped candidate count) before pagination, or compute the score in SQL; then paginate the ordered set. Keep `distance`, `compatibility_score` and `rank` in the resources.
- When the client has no vector (or no embedding for the target), set α = 0 and redistribute it proportionally across the other weights.
- Decision required: should `face_shape_compatible` filter results (PRD §5) or only boost; and should it default to the authenticated client's latest face analysis.
- Respect the existing Pennant flag `backend/modules/ClientRecommendation/Features/ExploreRankingFeature.php` for A/B variants.
### Dashboard (BFF / React)
- None.
### Mobile (Flutter / Repositories)
- None required — mobile already renders server order. Verify `apps/client_app/lib/src/features/discovery/discovery.bloc.dart` does not re-sort client-side.

## Acceptance Criteria
- [ ] With 2 pages of results, the highest-scoring branch overall is item 1 on page 1 (Feature test with seeded edges/embeddings).
- [ ] `rank` values are contiguous across pages (page 2 starts at `per_page + 1`).
- [ ] For a client without a vector, weights sum to 1.0 with α = 0 (Unit test on `ExploreRankingWeightsResolver`).
- [ ] `face_shape_compatible` behaviour matches the recorded decision and is tested.
- [ ] `php artisan test` passes; PHPStan max + Pint clean.

## Out of Scope
- Recompute command, edges and vector storage — Task 62, Task 63.

> Note (Task 42): use the stored `rating_avg`/`rating_count` columns on `branches` and `barbers` for the rating weight.

> Note (Task 45): `explore/search` merges branch and freelancer candidates by distance only; apply the composite ranking to the merged list (both resolvers expose `candidates()`).
