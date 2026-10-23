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
  - **Decision (resolved, best option): explicit filter, implicit boost.** The PRD table defines the parameter as a filter; defaulting a filter to stored analysis would hide shops without the client asking, so the stored analysis only feeds γ.
- Respect the existing Pennant flag `backend/modules/ClientRecommendation/Features/ExploreRankingFeature.php` for A/B variants.
### Implemented contract
- Shared code path: `Modules\Explore\Support\ExploreRanker` (`score()`, `order()`, `paginate()`, `faceShapeFor()`), used by `ExploreBranchesEloquentResolver::resolve()`, `ExploreBarbersEloquentResolver::resolve()` and `ExploreSearchEloquentResolver` (branches and freelancers scored on one scale and ordered together). `RecommendationFactorWeightsValueObject::withoutAlpha()` redistributes α; Pennant variants still come from `ExploreRankingWeightsResolver`.
- Scope of the rule: score = geographic·w_geo + cosine(client vector, target embedding)·α + edge weight·β + face match·γ, geographic = 1/(1 + distance/radius); α → 0 with proportional redistribution when the client or target has no vector; ordering score desc, then distance, then id; `rank` is global (page 2 starts at `per_page + 1`). Candidates are capped at the nearest `ExploreRanker::CANDIDATE_CAP` (500). Guests are ranked too (geographic only, i.e. distance order).
- Request: unchanged; `face_shape_compatible` (now also on `explore/search`) filters to entities offering an active service whose active catalog item lists that shape.
- Success: `compatibility_score` and `rank` are set on every item for every caller; `meta.pagination.total` counts the ranked candidates.
- Dashboard: none. Mobile: none required; verified `client_app` renders `page.items` in server order (no client re-sort). Docs: this spec, `docs/decisions-required.md`, `backend/docs/feature-index.md`.
- Deviations from the original spec text: the explore A/B tests' expected margins were updated to the redistributed weights (β/(1−α)). Fixed in passing: the face-match boost queried `service_catalog_items.active`, which does not exist (`is_active`). No rating weight was added (not in the PRD formula).

### Dashboard (BFF / React)
- None.
### Mobile (Flutter / Repositories)
- None required — mobile already renders server order. Verify `apps/client_app/lib/src/features/discovery/discovery.bloc.dart` does not re-sort client-side.

## Acceptance Criteria
- [x] With 2 pages of results, the highest-scoring branch overall is item 1 on page 1 (Feature test with seeded edges/embeddings).
- [x] `rank` values are contiguous across pages (page 2 starts at `per_page + 1`).
- [x] For a client without a vector, weights sum to 1.0 with α = 0 (Unit test on `ExploreRankingWeightsResolver`).
- [x] `face_shape_compatible` behaviour matches the recorded decision and is tested.
- [x] `php artisan test` passes; Pint clean (PHPStan skipped for this run on the user's instruction).

## Out of Scope
- Recompute command, edges and vector storage — Task 62, Task 63.

> Note (Task 42): use the stored `rating_avg`/`rating_count` columns on `branches` and `barbers` for the rating weight.

> Note (Task 45): `explore/search` merges branch and freelancer candidates by distance only; apply the composite ranking to the merged list (both resolvers expose `candidates()`).
