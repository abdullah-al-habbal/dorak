# Task 60: Fix Favorites and Saved Filter Contracts

**Phase:** Phase 10 — Client Intelligence · **Priority:** P2 · **Depends on:** None · **Audit source:** Feature-spec audit (BE-14); mobile audit (saved filters unwired); `backend/docs/02_prd.md:274-275` (INT-3/INT-4)

## Overview & Root Cause
**Favorites (INT-3):**
- **No toggle.** Adding a favorite is a plain `create`, so a duplicate hits the unique index and becomes a database error instead of a toggle or idempotent no-op.
- **No existence check.** `favorable_id` isn't checked to exist for its type.

**Saved filters (INT-4):**
- **`price_range` is silently dropped.** The spec's `price_range{min,max}` is lost because the value object reads flat `price_min`/`price_max`.
- **Mobile can't read or update one filter.** The mobile repository has no method for `GET saved-filters/{filter}` or for update.

## Evidence
- `backend/modules/ClientInteraction/Eloquent/Resolvers/AddFavoriteEloquentResolver.php:14` — `ClientFavoriteModel::create([...])`.
- `backend/modules/ClientInteraction/Database/Migrations/2026_07_19_000001_create_client_favorites_table.php:19` — unique `(client_id, favorable_id, favorable_type)`.
- `backend/modules/ClientInteraction/Http/Requests/Client/AddFavoriteRequest.php:17` — `favorable_id` is `['required','string']`.
- `backend/modules/ClientInteraction/ValuesObjects/FilterConfigurationValueObject.php:16-17,32-33,49-50` — `price_min`/`price_max` only.
- `frontend/mobile/packages/core/lib/src/network/repositories/client_interaction.repository.dart:4-12` — get-list, save, delete and preferences only; no get-one or update.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Make `POST /api/v1/client/favorites` idempotent: `firstOrCreate`, returning 200 with the existing favorite or 201 when created. Decision required: idempotent add, or true toggle (a second call removes). Idempotent add is recommended because `DELETE /client/favorites/{favorite}` already exists.
- Validate that `favorable_id` exists in the table mapped by `favorable_type` (custom rule). Unknown IDs return 422.
- `FilterConfigurationValueObject`: accept `price_range.min/max` as the canonical input, and keep `price_min/price_max` as a backwards-compatible alias. Serialize as `price_range`.
- Update `CreateSavedFilterRequest` and `UpdateSavedFilterRequest` rules to match.

### Dashboard (BFF / React)
- None. Favorites and saved filters are client-only features.

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/network/repositories/client_interaction.repository.dart`: add `getSavedFilter(id)` and `updateSavedFilter(id, …)`, and send `price_range`.
- `frontend/mobile/packages/core/lib/src/network/repositories/favorite.repository.dart`: treat both 200 and 201 from `addFavorite` as success.
- UI wiring for saved filters is in Task 80.

## Acceptance Criteria
- [ ] A second `POST /api/v1/client/favorites` with the same target returns 200 (not 500), and exactly one row exists.
- [ ] `favorable_id` of a non-existent branch returns 422.
- [ ] Saving a filter with `price_range: {min: 10, max: 50}` and reading it back via `GET /api/v1/client/saved-filters/{filter}` returns the same `price_range`.
- [ ] Legacy `price_min`/`price_max` input is still accepted and read back as `price_range`.
- [ ] Mobile repository tests for `getSavedFilter`/`updateSavedFilter` pass (`melos run test`).
- [ ] `php artisan test` passes; PHPStan max + Pint clean.

## Out of Scope
- Applying discovery preferences in Explore and interaction logging (Task 47).
- Client UI for saved filters (Task 80).
