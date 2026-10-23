# Task 47: Apply Discovery Preferences and Log Interactions

**Phase:** Discovery · **Priority:** P1 · **Depends on:** Task 46 · **Audit source:** Feature-spec audit — BE-14 (discovery preferences, interaction logging); product-spec audit — INT-1/INT-2/INT-5 (`backend/docs/02_prd.md:272-276`, `backend/docs/04_house-rules.md:146`)

## Overview & Root Cause
Clients can save discovery preferences (`hidden_brand_ids`, `show_unavailable`, `default_radius`), but Explore never reads them, so saving them has no effect. The interaction log table and model exist, yet nothing writes views, searches or favorites to it, so the nightly recommendation job runs only on favorites and bookings.

## Evidence
- `backend/modules/ClientInteraction/Models/ClientDiscoveryPreferenceModel.php`, `backend/modules/ClientInteraction/Eloquent/Resolvers/UpdateDiscoveryPreferenceEloquentResolver.php` — preferences stored.
- No reference to `hidden_brand_ids`, `show_unavailable` or `default_radius` under `backend/modules/Explore/` (grep returns nothing).
- `backend/modules/ClientInteraction/Models/ClientInteractionLogModel.php` — model is referenced nowhere else; `backend/modules/ClientInteraction/Database/Migrations/2026_07_19_000003_create_client_interaction_logs_table.php` creates the table.
- `backend/modules/ClientInteraction/Enums/InteractionTypeEnum.php` — `View`, `Search`, `Favorite` defined but unused.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Explore (authenticated client): exclude `hidden_brand_ids`; use `default_radius` when `radius` is omitted; when `show_unavailable = false`, apply the `available_now` filter.
- Write interaction logs: `view` on branch/barber detail, `search` on explore with `q`/filters, `favorite` on add-favorite. Write asynchronously (queued) so explore latency is unaffected.
- Confirm the nightly `RecomputeClientVectorsCommand` reads interaction logs (coordinate with Task 62).
### Decision
  - **Decision (best option, no product decision was open): one recorder + queued job; search rows without a target.** `ClientInteractionRecorder` is the only writer and dispatches `RecordClientInteractionJob` after commit, keeping explore latency flat. A search has no single entity, so `interactable_*` was widened to nullable (opted-out contract migration) instead of attaching searches to an arbitrary result; the query, filters, universe, screen and result count go in `context` (INT-2).

### Implemented contract
- Shared code path: `Modules\ClientInteraction\Services\ClientDiscoveryPreferences::for()` (read by the `AppliesDiscoveryPreferences` trait on `ExploreBranchesRequest`, `ExploreBarbersRequest`, `ExploreSearchRequest`); `Modules\ClientInteraction\Services\ClientInteractionRecorder` (`view()`, `search()`, `favorite()`) used by `GetBranchDetailAction`, `GetBarberDetailAction`, `ExploreBranchesAction`, `ExploreBarbersAction`, `ExploreSearchAction` (via `Modules\Explore\Support\ExploreSearchLog`) and `AddFavoriteAction`.
- Scope of the rule: preferences apply only to a signed-in client (`client` guard): `hidden_brand_ids` removes those brands' branches (branch list and unified search); a missing `radius` takes `default_radius`; `show_unavailable = false` applies `available_now` unless the request sends `available_now`. Logs are written only for signed-in clients: `view` per detail request, `search` when `q` or any filter beyond location is present (a plain map browse is not logged), `favorite` per created favorite. `context.screen` = `X-Client-Screen` header (≤64 chars) else the route name; `context.universe` = the explicit universe else the client's preference.
- Request: explore `radius` is now optional for clients with a saved `default_radius`; optional `X-Client-Screen` header.
- Failure: no `radius` and no saved default → 422 (unchanged for guests).
- Success: unchanged responses; one `client_interaction_logs` row per logged interaction (queued, after commit). Migration `2026_10_23_000002_allow_search_rows_in_client_interaction_logs` makes `interactable_type`/`interactable_id` nullable.
- Dashboard: none. Mobile: none (logging is server-side; the preferences UI is Task 80; the app may send `X-Client-Screen`). Docs: this spec, `backend/docs/feature-index.md`, Task 62 note.
- Deviations from the original spec text: `RecomputeClientVectorsCommand` does not read interaction logs yet; that is Task 62's `visited` edges work (noted there).

### Dashboard (BFF / React)
- None.
### Mobile (Flutter / Repositories)
- Discovery-preferences UI is wired in Task 80 (`packages/core/lib/src/network/repositories/client_interaction.repository.dart`). No extra call needed for logging (server-side).

## Acceptance Criteria
- [x] Authenticated client with `hidden_brand_ids = [X]` → no branch of brand X in `explore/branches` (Feature test).
- [x] Omitting `radius` uses the saved `default_radius` (test), or validation error if neither is present.
- [x] `GET explore/branches/{branch}` by an authenticated client inserts one `view` log row; `POST` favorite inserts one `favorite` row (tests with `Queue::fake()` / sync queue).
- [x] Guest requests write no logs.
- [x] `php artisan test` passes; Pint clean (PHPStan skipped for this run on the user's instruction).

## Out of Scope
- Saved filters contract fixes — Task 60.
- Recommendation recompute fixes — Task 62.

> Note (Task 43): log searches from the `q` parameter on `explore/branches` and `explore/barbers`.
