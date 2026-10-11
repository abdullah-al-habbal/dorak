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
- Decision required: SQL `LIKE` across translatable JSON columns vs a search engine (Scout/Meilisearch); the DB engine question in Task 63 affects this.
- Interaction logging of searches is handled by Task 47.
### Dashboard (BFF / React)
- None — client discovery only.
### Mobile (Flutter / Repositories)
- Add `q` to `packages/core/lib/src/network/repositories/explore.repository.dart` `getBranches`/`getBranchesPayload` and to `apps/client_app/lib/src/features/discovery/discovery_filter.entity.dart`.
- Add a search field to `apps/client_app/lib/src/features/discovery/discovery.screen.dart` with debounce; dispatch through `discovery.bloc.dart`.

## Acceptance Criteria
- [ ] `GET explore/branches?q=<branch name fragment>` returns the matching branch and excludes non-matching ones within radius (Feature test).
- [ ] `q` matching only a brand name returns that brand's branches.
- [ ] `q` matching an Arabic name returns the branch (translatable fields searched in both locales).
- [ ] `q` longer than 100 chars → 422.
- [ ] Mobile bloc test: typing a query triggers exactly one request after debounce.
- [ ] `php artisan test` and `melos run test` pass; PHPStan max + Pint clean.

## Out of Scope
- Freelancers in branch search results — Task 45.
- Ranking order — Task 46.
