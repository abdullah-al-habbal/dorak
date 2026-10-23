# Task 43: Add Explore Text Search

**Phase:** Discovery · **Priority:** P1 · **Depends on:** Task 09, Task 51, Task 61 · **Audit source:** Product-spec audit — Discovery (`backend/docs/02_prd.md:59`, `backend/docs/01_vision-and-scope.md:76`, REC-5 `backend/docs/02_prd.md:285`, SC-6 `backend/docs/02_prd.md:249`)

## Overview & Root Cause
The PRD requires keyword search over branch name, brand name and tags, plus search by service tags and face shape. Neither explore endpoint accepts a text query: discovery is purely geographic with structured filters. Clients cannot find a known shop or a service by name.

## Evidence
- `backend/modules/Explore/Http/Requests/Shared/ExploreBranchesRequest.php:17-29` — no `q`/search parameter.
- `backend/modules/Explore/Http/Requests/Shared/ExploreBarbersRequest.php:15-26` — no `q`/search parameter.
- `backend/modules/Explore/Routes/Api/V1/explore.php:11-15` — no search route.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Add optional `q` (string, max 100) to both explore requests; match branch name, brand name, branch tags (Task 51), offered service names and catalog item tags (Task 61). Barber search matches barber name and service names.
- Add `tag_ids[]` filter.
  - **Decision (resolved, best option): portable SQL `LIKE` over each locale's JSON path.** The radius filter keeps the candidate set small, no new infrastructure is needed, and it works on both MySQL and SQLite; a search engine is deferred until relevance ranking or catalog size require it.
- Interaction logging of searches is handled by Task 47.
### Implemented contract
- Shared code path: `Modules\Explore\Support\ExploreTextSearch` (`pattern()`, `orMatchTranslatable()`, `tagExists()`), used by `ExploreBranchesEloquentResolver` and `ExploreBarbersEloquentResolver`.
- Scope of the rule: branches match on branch `name`, brand `name`, active offered-service `name`, active catalog-item `name` and active catalog-tag `name`, each in `en` and `ar`; barbers match on barber `name` and their active services/catalog items/tags. Matching is a case-insensitive substring; `%`, `_` and `!` are literal. Branch storefront tags (Task 51) do not exist yet and are not searched.
- Request: `GET explore/branches` and `GET explore/barbers` accept `q` (optional string, ≤100, trimmed; blank = no search) and `tag_ids[]` (UUIDs of `service_catalog_item_tags`; keeps entities offering an active service whose active catalog item carries one of the tags). Search combines with the existing radius and filters.
- Failure: `q` over 100 characters or an unknown `tag_ids` entry → 422 validation error.
- Success: unchanged paginated payload.
- Dashboard: none. Mobile: `core` `ExploreRepository.getBranches/getBranchesPayload` gain `query` (sent as trimmed `q`, omitted when blank); `client_app` `DiscoveryFilters.query`; `DiscoveryBloc` debounces `DiscoverySearchChanged` by 400 ms and then reloads through the same path as filter changes (one request per pause); the feed no longer filters the loaded page by branch name locally (the server result already matches brand and service names); the search field gains an en/ar hint. Docs: this spec, `docs/decisions-required.md`, `backend/docs/feature-index.md`.
- Deviations from the original spec text: branch storefront tags wait for Task 51 (extend `ExploreTextSearch` there). Pre-existing, not fixed here: the mobile catalog-item filter chips parse UUID ids with `int.tryParse` and never render (Task 61 scope).

### Dashboard (BFF / React)
- None — client discovery only.
### Mobile (Flutter / Repositories)
- Add `q` to `packages/core/lib/src/network/repositories/explore.repository.dart` `getBranches`/`getBranchesPayload` and to `apps/client_app/lib/src/features/discovery/discovery_filter.entity.dart`.
- Add a search field to `apps/client_app/lib/src/features/discovery/discovery.screen.dart` with debounce; dispatch through `discovery.bloc.dart`.

## Acceptance Criteria
- [x] `GET explore/branches?q=<branch name fragment>` returns the matching branch and excludes non-matching ones within radius (Feature test).
- [x] `q` matching only a brand name returns that brand's branches.
- [x] `q` matching an Arabic name returns the branch (translatable fields searched in both locales).
- [x] `q` longer than 100 chars → 422.
- [x] Mobile bloc test: typing a query triggers exactly one request after debounce.
- [x] `php artisan test` and `melos run test` pass; Pint clean (PHPStan skipped for this run on the user's instruction).

## Out of Scope
- Freelancers in branch search results — Task 45.
- Ranking order — Task 46.
