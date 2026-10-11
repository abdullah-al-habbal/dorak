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
- Decision required: whether `dashboard/profile/notifications` is replaced by Preference or kept as an alias.
- Task 57 reads `display_currency_id` and `price_display_mode`.

### Dashboard (BFF / React)
- Add a settings page under the profile area, through a BFF route to `dashboard/settings`.
- Persist the chosen language to drive UI locale and API `Accept-Language`.

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/network/repositories/profile.repository.dart`: add `getSettings` and `updateSettings`.
- client_app profile settings screen: language, currency, price mode. stylist_app and business_app settings screens are in Tasks 83 and 85.

## Acceptance Criteria
- [ ] `GET /api/v1/client/settings` returns 200 with defaults for a client with no row, and creates exactly one `preferences` row.
- [ ] `PATCH /api/v1/client/settings` with `display_currency_id` of a non-existent currency returns 422.
- [ ] A client cannot read or modify another owner's settings (no ID in the path; Feature test asserts scoping).
- [ ] With `preferred_language=ar`, translatable resources come back in Arabic for that user (Feature test).
- [ ] Equivalent Feature tests pass for the barber and branch guards.
- [ ] Mobile repository unit tests cover get/update (`melos run test` passes).
- [ ] `php artisan test` passes; PHPStan max + Pint clean.

## Out of Scope
- Currency conversion of prices (Task 57).
- Brand-level feature flags (Task 50).
