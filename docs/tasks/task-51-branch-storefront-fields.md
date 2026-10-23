# Task 51: Add Branch Storefront Fields and Opening Hours

**Phase:** Phase 8 — Brand, Branch & Barber Platform · **Priority:** P2 · **Depends on:** Task 12, Task 44 · **Audit source:** Product-spec audit (Branch/Brand); `backend/docs/01_vision-and-scope.md:74`, `backend/docs/06_entity-model-abstract.md:80-84`, `backend/docs/03_persona-journeys.md:36,54`

## Overview & Root Cause
The product promises a per-branch digital storefront: profile, hours, location, services and prices. The entity model requires a translatable description, a translatable address, opening/closing hours and a gender category. The `branches` table has only name, email, password, status and coordinates, so none of these fields exist. Managers also cannot "adjust today's hours" (persona journey).

## Evidence
- `backend/modules/Branch/Database/Migrations/0001_01_01_200011_create_branches_table.php:14-24` — columns: id, brand_id, name, email, password, status, latitude, longitude only.
- `frontend/dashboard/src/services/api/dashboard/branch-form.schema.ts:6-13` — the form has only name, brandId, email, password, lat/lng, status.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Migration: add `description` (json, translatable), `address` (json, translatable), and `tags` (json array or a pivot). Gender category is handled in Task 44.
- New table `branch_opening_hours` (branch_id, weekday 0–6, opens_at, closes_at, is_closed), plus `branch_hours_overrides` (branch_id, date, opens_at, closes_at, is_closed) for "today's hours".
- Extend `PATCH /api/v1/branch/profile` and `PUT /api/v1/dashboard/branches/{branch}` to accept these fields. Add `PUT /api/v1/branch/opening-hours` and `PUT /api/v1/branch/hours-overrides/{date}`.
- Expose fields and hours in `GET /api/v1/explore/branches/{branch}` and `GET /api/v1/branch/profile`.
- Task 22 consumes the hours for booking validation.

### Dashboard (BFF / React)
- `frontend/dashboard/src/services/api/dashboard/branch-form.schema.ts` and `frontend/dashboard/src/services/api/dashboard/ibranch.types.ts`: add the new fields.
- Add an opening-hours editor to the branch form. The branch-scoped BFF routes are added in Task 74.

### Mobile (Flutter / Repositories)
- client_app: `frontend/mobile/apps/client_app/lib/src/features/booking/widgets/branch_detail_body.widget.dart` should render description, address and today's hours. Extend the branch detail DTO in `frontend/mobile/packages/core/lib/src/network/repositories/explore.repository.dart`.
- business_app: hours editing UI is in Task 85.

## Acceptance Criteria
- [x] Migrations run up and down cleanly on the test DB.
- [x] `PATCH /api/v1/branch/profile` with `description.en/ar` and `address.en/ar` returns 200 and persists both locales.
- [x] `PUT /api/v1/branch/opening-hours` with 7 entries returns 200. `closes_at <= opens_at` returns 422.
- [x] A same-day override is returned as `today_hours` in `GET /api/v1/explore/branches/{branch}`.
- [x] A branch user cannot edit another branch's hours (403 test).
- [x] Dashboard form schema test covers the new fields (`npm run test` passes).
- [x] client_app widget test asserts that the address and today's hours render.
- [x] `php artisan test` passes; Pint clean (PHPStan skipped for this run on the user's instruction).

## Implemented contract
- Schema: `branches.description` / `branches.address` (json, Spatie-translatable en/ar), `branches.tags` (json list of strings, cast `json:unicode` so Arabic tags stay searchable); `branch_opening_hours` (unique `branch_id, weekday`; weekday 0 = Sunday, Carbon `dayOfWeek`) and `branch_hours_overrides` (unique `branch_id, date`), both `opens_at`/`closes_at` nullable `time` + `is_closed`, cascade on branch delete.
- Shared code path: `Modules\Branch\Services\BranchHours` (`replaceWeek`, `setOverride`, `clearOverride`, `week`, `forDate`, `covers`) and `Modules\Branch\Support\OpeningHoursRules` (validation reused by branch-account and dashboard requests).
- Branch account (`auth:branch_api`): `PATCH /api/v1/branch/profile` now uses `UpdateProfileRequest` (`name`, coordinates, `description.en/ar` ≤ 2000, `address.en/ar` ≤ 255, `tags[]` ≤ 20 × 40 chars); `PUT /api/v1/branch/opening-hours` with `hours: [{weekday, is_closed?, opens_at, closes_at}]` (1–7 distinct weekdays, upserted per day); `PUT /api/v1/branch/hours-overrides/{Y-m-d}` with `{is_closed?, opens_at, closes_at}`; `DELETE /api/v1/branch/hours-overrides/{Y-m-d}` clears it. All write endpoints honour Task 50's `ensureBranchManageable` (403 `feature_not_enabled` on a locked branch). `GET/PATCH profile` and the hours endpoints return `BranchProfileResource`: the public branch fields plus `translations.{name,description,address}`, `opening_hours`, `today_hours`.
- Dashboard: `POST/PUT /api/v1/dashboard/branches` accept `description`, `address`, `tags`, `opening_hours` (same rules); show/store/update responses include `opening_hours`. A manager editing another branch gets 403 (existing actor scope).
- Public: `BranchResource` (lists and detail) adds localized `description`, `address` (null when empty) and `tags`; `GET /api/v1/explore/branches/{branch}` adds `opening_hours` and `today_hours` (`{date, is_closed, opens_at, closes_at, source: override|weekly}` or null when nothing is configured). Explore `q` also matches branch tags (Task 43 note).
- Failure: 422 `VALIDATION_FAILED` for `closes_at <= opens_at`, bad `H:i`, duplicate weekdays, missing times on an open day or an invalid date; 401 without the branch guard.
- Booking (completes Task 22's pending branch-hours sub-criterion): client create, dashboard walk-in/reschedule and branch/barber slot generation reject or hide intervals outside the branch's effective hours for that date with 422 `booking_outside_schedule`. At-home and freelancer bookings (no branch) are unaffected.
- Dashboard UI: branch form gains description/address (en/ar) inputs and a seven-day `BranchOpeningHoursEditor` (`branch-opening-hours.util.ts` sends only configured days); en/ar copy; Vitest for schema, mappers and utils. Mobile: `core` `BranchHoursDto` and `BranchDetailDto.description/address/tags/openingHours/todayHours`; client_app `BranchStorefront` widget on branch detail; ARB en/ar keys `branchTodayHours`, `branchClosedToday`, `branchAddressLabel`; widget + DTO tests.

### Decisions (best option)
- **No hours configured = always open**, mirroring barber schedules (Task 22): existing branches stay bookable until a manager sets hours. Once any weekly row exists, a weekday without a row is closed.
- **Override beats weekly** for its date; an override can close the day (`is_closed`) or set different times. A date with only an override is enforced even when no weekly rows exist.
- **Times are UTC wall-clock `H:i`**, the same rule as barber schedules, until a branch timezone column exists. Overnight hours (closing after midnight) are not supported: `closes_at` must be after `opens_at` on the same day, and a booking must end by the closing time.
- **Tags are free-form strings** on the branch (json list), not a pivot to catalog tags: catalog tags describe services; storefront tags are marketing labels the manager owns. Search matches them.
- Dashboard hours editor sends only configured days, so leaving a day blank never silently closes it; clearing a previously saved day is done by marking it closed (or via the branch API).

## Out of Scope
- Booking validation against hours (Task 22).
- Gender category / unisex (Task 44).
- Business app hours UI (Task 85).

> Note (Task 43): when branch tags are added, extend `Modules\Explore\Support\ExploreTextSearch` usage in `ExploreBranchesEloquentResolver` so `q` matches them too.
