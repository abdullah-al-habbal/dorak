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
### Dashboard (BFF / React)
- None.
### Mobile (Flutter / Repositories)
- Discovery-preferences UI is wired in Task 80 (`packages/core/lib/src/network/repositories/client_interaction.repository.dart`). No extra call needed for logging (server-side).

## Acceptance Criteria
- [ ] Authenticated client with `hidden_brand_ids = [X]` → no branch of brand X in `explore/branches` (Feature test).
- [ ] Omitting `radius` uses the saved `default_radius` (test), or validation error if neither is present.
- [ ] `GET explore/branches/{branch}` by an authenticated client inserts one `view` log row; `POST` favorite inserts one `favorite` row (tests with `Queue::fake()` / sync queue).
- [ ] Guest requests write no logs.
- [ ] `php artisan test` passes; PHPStan max + Pint clean.

## Out of Scope
- Saved filters contract fixes — Task 60.
- Recommendation recompute fixes — Task 62.
