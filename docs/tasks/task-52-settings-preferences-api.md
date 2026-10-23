# Task 52: Expose Settings and Preferences API

**Phase:** Phase 8 — Brand, Branch & Barber Platform · **Priority:** P2 · **Depends on:** Task 32, Task 38 · **Audit source:** Product-spec audit (Branch/Brand); `backend/docs/02_prd.md:127`, `backend/docs/05_domain-glossary.md:57`

## Overview & Root Cause
The PRD says each Brand, Branch, Barber and Client owns a Settings record (language, notifications, display currency, theme/universe, price-display mode). The `Preference` module has a polymorphic model, a migration, a factory and a Filament admin panel, but no routes or HTTP actions. Nothing in the API reads these settings, so language, display currency and price-display mode have no effect.

## Evidence
- `backend/modules/Preference/Database/Migrations/0001_01_01_200020_create_preferences_table.php` — table exists.
- `backend/modules/Preference/` — contains Config, Database, Filament, Models and Providers only. There is no `Routes/` or `Http/` directory.
- `backend/modules/Dashboard/` — has a separate `GET/PATCH /api/v1/dashboard/profile/notifications`, which overlaps with Preference notification settings.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Add `GET/PATCH` settings endpoints per actor, each scoped to the authenticated owner:
  - `/api/v1/client/settings` (auth:client)
  - `/api/v1/barber/settings` (auth:barber)
  - `/api/v1/branch/settings` (auth:branch_api)
  - `/api/v1/dashboard/settings` (dashboard actor)
- Lazily create the preference row on first GET (`firstOrCreate` on the morph).
- Validate `preferred_language` (en|ar), `display_currency_id` (exists:currencies), `price_display_mode` (enum), `theme`, `notification_enabled`.
- Apply `preferred_language` as the response locale for the authenticated user. The locale middleware currently lives only in the Website module (unverified at runtime).
- **Decision (dashboard/profile/notifications, resolved): kept, unchanged.** It is a distinct, finer-grained concept (per-channel email/push/booking/system toggles) from Preference's single `notification_enabled` flag; replacing it would lose granularity for no benefit. The new `dashboard/settings` endpoint exposes `notification_enabled` alongside it for parity with the other three actors.
- Task 57 reads `display_currency_id` and `price_display_mode`.

### Implemented contract
- Shared code path: `Modules\Preference\Handlers\GetSettingsHandler::handle()` / `UpdateSettingsHandler::handle()`, backed by `GetOrCreateSettingsEloquentResolver` / `UpdateSettingsEloquentResolver`. Used by `GET/PATCH /api/v1/client/settings`, `GET/PATCH /api/v1/barber/settings`, `GET/PATCH /api/v1/branch/settings`, `GET/PATCH /api/v1/dashboard/settings` (all four Actions in `Modules\Preference\Http\Actions\{Client,Barber,Branch,Dashboard}`).
- Scope of the rule: each actor's settings resolve to one `preferences` row keyed by `(preferenceable_type, preferenceable_id)` where the owner is the actor's own entity (`client`/`barber`/`branch`/`admin` morph aliases, already registered in `ApplicationServiceProvider::registerMorphMap()`). A dashboard `owner` actor (Task 38 brand owner) maps to the owning `client` row, so an owner's dashboard settings and their client-app settings are the same row by design. The row is lazily created on first `GET` or `PATCH` (`firstOrCreate`), never pre-seeded.
- Request (PATCH): `preferred_language` (`ar`|`en`, nullable), `notification_enabled` (bool), `display_currency_id` (nullable, `exists:currencies,id`), `theme` (`light`|`dark`, nullable, new `Modules\Preference\Enums\ThemeEnum`), `price_display_mode` (`tax_inclusive`|`tax_exclusive`, nullable, new `Modules\Preference\Enums\PriceDisplayModeEnum`). All fields are `sometimes` (partial update).
- Failure: an unknown `display_currency_id` returns HTTP 422 `VALIDATION_FAILED` with `errors.display_currency_id`; the row is left unchanged (validation runs before any write). A request from one owner can never read or write another owner's row — there is no ID in the path or request body, the owner is derived solely from the authenticated guard/dashboard actor.
- Success: HTTP 200, `data` = `{preferred_language, notification_enabled, display_currency_id, theme, price_display_mode}` via `SettingsResource`. Side effect: `Modules\Preference\Http\Middleware\ApplyPreferredLocaleMiddleware`, added to the authenticated route groups of `client`, `barber`, `branch_api` and `dashboard`, calls `App::setLocale()` from the stored `preferred_language` on every authenticated request by that actor, so Spatie-translatable resources respond in that locale, not just the settings endpoints.
- Dashboard: the existing BFF catch-all `frontend/dashboard/src/app/api/dashboard/[...path]/route.ts` is extended to allow and case-convert the `settings` path (`dashboard-path.util.ts`, `dashboard-profile-bff.util.ts`); a `settings` profile tab and page exist under all four portal roots (`src/app/(portals)/{admin,manager,owner,barber}/profile/settings/`), rendered by `src/components/profile/settings/settings-preferences.tsx`. Mobile: `frontend/mobile/packages/core/lib/src/network/repositories/profile.repository.dart` gains `getSettings`/`updateSettings` (backed by a new `SettingsDto`); `client_app` gets a `SettingsCubit` + `SettingsScreen` (language/currency/price mode) reachable from the profile tab.
- Deviations from the original spec text: none beyond the dashboard-notifications decision above.

### Dashboard (BFF / React)
- Add a settings page under the profile area, through a BFF route to `dashboard/settings`.
- Persist the chosen language to drive UI locale and API `Accept-Language`.

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/network/repositories/profile.repository.dart`: add `getSettings` and `updateSettings`.
- client_app profile settings screen: language, currency, price mode. stylist_app and business_app settings screens are in Tasks 83 and 85.

## Acceptance Criteria
- [x] `GET /api/v1/client/settings` returns 200 with defaults for a client with no row, and creates exactly one `preferences` row.
- [x] `PATCH /api/v1/client/settings` with `display_currency_id` of a non-existent currency returns 422.
- [x] A client cannot read or modify another owner's settings (no ID in the path; Feature test asserts scoping).
- [x] With `preferred_language=ar`, translatable resources come back in Arabic for that user (Feature test).
- [x] Equivalent Feature tests pass for the barber and branch guards.
- [x] Mobile repository unit tests cover get/update (`melos run test` passes).
- [x] `php artisan test` passes; Pint clean. PHPStan is skipped per `backend/CLAUDE.md` repo policy (not a required gate).

## Out of Scope
- Currency conversion of prices (Task 57).
- Brand-level feature flags (Task 50).
