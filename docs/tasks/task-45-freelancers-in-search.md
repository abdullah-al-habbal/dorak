# Task 45: Include Freelancers in Search Results

**Phase:** Discovery · **Priority:** P1 · **Depends on:** Task 43, Task 44 · **Audit source:** Product-spec audit — Discovery (`backend/docs/02_prd.md:119`, `backend/docs/08_edge-cases.md:59` EC-11)

## Overview & Root Cause
The PRD says search results include freelancers alongside shops, and EC-11 says freelancers without a fixed address must still be findable. Today freelancers only appear in a separate `explore/barbers` endpoint that requires `is_freelancer = true` and non-null coordinates, so a freelancer without coordinates never appears anywhere, and branch searches never surface freelancers.

## Evidence
- `backend/modules/Explore/Eloquent/Resolvers/Shared/ExploreBarbersEloquentResolver.php:32-33` — `where('is_freelancer', true)->whereNotNull('latitude')`.
- `backend/modules/Explore/Routes/Api/V1/explore.php:12,14` — separate `branches` and `barbers` endpoints, no combined search.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Decision required: a unified `GET explore/search` returning typed items (`branch` | `barber`), or keep two endpoints and have the client merge them. Record the decision.
- Freelancers without coordinates: match by service area (travel radius from a declared base location) or include them in text search (`q`, Task 43) regardless of distance. Document the chosen rule.
- Keep `explore/barbers` behaviour for backward compatibility until mobile migrates.
### Dashboard (BFF / React)
- None — client discovery only.
### Mobile (Flutter / Repositories)
- `packages/core/lib/src/network/repositories/explore.repository.dart` and `apps/client_app/lib/src/features/discovery/discovery.bloc.dart`: render mixed results (branch card vs barber card) per the decision; barber cards navigate to `stylist_profile.screen.dart`.

## Acceptance Criteria
- [ ] A text search matching a freelancer's name returns that freelancer even when the freelancer has no coordinates (Feature test).
- [ ] A geographic search returns freelancers inside the radius together with branches (or via the documented two-endpoint contract), covered by a Feature test.
- [ ] Non-freelancer barbers are not returned as standalone results.
- [ ] Mobile discovery shows both card types; widget test asserts a barber card renders.
- [ ] `php artisan test` and `melos run test` pass; PHPStan max + Pint clean.

## Out of Scope
- Barber discovery screen and direct booking on mobile — Task 79.
