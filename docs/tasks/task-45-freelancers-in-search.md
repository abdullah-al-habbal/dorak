# Task 45: Include Freelancers in Search Results

**Phase:** Discovery · **Priority:** P1 · **Depends on:** Task 43, Task 44 · **Audit source:** Product-spec audit — Discovery (`backend/docs/02_prd.md:119`, `backend/docs/08_edge-cases.md:59` EC-11)

## Overview & Root Cause
The PRD says search results include freelancers alongside shops, and EC-11 says freelancers without a fixed address must still be findable. Today freelancers only appear in a separate `explore/barbers` endpoint that requires `is_freelancer = true` and non-null coordinates, so a freelancer without coordinates never appears anywhere, and branch searches never surface freelancers.

## Evidence
- `backend/modules/Explore/Eloquent/Resolvers/Shared/ExploreBarbersEloquentResolver.php:32-33` — `where('is_freelancer', true)->whereNotNull('latitude')`.
- `backend/modules/Explore/Routes/Api/V1/explore.php:12,14` — separate `branches` and `barbers` endpoints, no combined search.

## Full-Stack Scope
### Backend (API / DB / Policies)
  - **Decision (resolved, best option): unified `explore/search` with typed items.** Only the server can order and paginate shops and freelancers together correctly; the per-type endpoints stay for compatibility. Freelancers without coordinates are found by `q` only.
- Freelancers without coordinates: match by service area (travel radius from a declared base location) or include them in text search (`q`, Task 43) regardless of distance. Document the chosen rule.
- Keep `explore/barbers` behaviour for backward compatibility until mobile migrates.
### Implemented contract
- Shared code path: `ExploreBranchesEloquentResolver::candidates()` and `ExploreBarbersEloquentResolver::candidates()` (the filtered, radius-bounded queries both per-type endpoints now paginate), `ExploreBarbersEloquentResolver::locationlessTextMatches()` (freelancers with no latitude/longitude, only when `q` is set), merged by `Modules\Explore\Eloquent\Resolvers\Shared\ExploreSearchEloquentResolver`.
- Scope of the rule: located results ordered by distance (ties by type, id), then location-less text matches; only discoverable freelancers (`is_freelancer = true`) appear as barbers; filters (`universe`, `q`, `tag_ids`, `catalog_item_ids`, `available_now`, `price_range`, `rating_min`) apply to both types exactly as on the per-type endpoints. No composite ranking yet (Task 46).
- Request: `GET /api/v1/explore/search` — `latitude`, `longitude`, `radius` required; optional `page`, `per_page` (≤100) and the filters above.
- Failure: missing/invalid location or filter values → 422 validation errors.
- Success: paginated `data[]` of `{type, distance, entity}` where `entity` is the `BranchResource` or `BarberResource` payload; `meta.pagination` covers the merged list.
- Dashboard: none. Mobile: `core` `ExploreEndpoints.search`, `ExploreSearchItemDto` (codegen, `branch`/`barber` read from `entity` by `type`), `ExploreRepository.searchPayload`; `client_app` discovery now pages `ExploreSearchItemDto` (first page, load-more and the feed cache), renders `DiscoveryResultCard` for shops and the new `DiscoveryBarberCard` (freelancer badge, rating, distance or "Travels to you") for freelancers, and opens the stylist profile through `onViewStylist` → `AppRoutes.barberDetail`. en/ar copy added. Docs: this spec, `docs/decisions-required.md`, `backend/docs/feature-index.md`.
- Deviations from the original spec text: service-area matching for location-less freelancers is not implemented (text search only, as documented). Old feed-cache entries (branch-shaped) fail to parse and are refetched.

### Dashboard (BFF / React)
- None — client discovery only.
### Mobile (Flutter / Repositories)
- `packages/core/lib/src/network/repositories/explore.repository.dart` and `apps/client_app/lib/src/features/discovery/discovery.bloc.dart`: render mixed results (branch card vs barber card) per the decision; barber cards navigate to `stylist_profile.screen.dart`.

## Acceptance Criteria
- [x] A text search matching a freelancer's name returns that freelancer even when the freelancer has no coordinates (Feature test).
- [x] A geographic search returns freelancers inside the radius together with branches (or via the documented two-endpoint contract), covered by a Feature test.
- [x] Non-freelancer barbers are not returned as standalone results.
- [x] Mobile discovery shows both card types; widget test asserts a barber card renders.
- [x] `php artisan test` and `melos run test` pass; Pint clean (PHPStan skipped for this run on the user's instruction).

## Out of Scope
- Barber discovery screen and direct booking on mobile — Task 79.
