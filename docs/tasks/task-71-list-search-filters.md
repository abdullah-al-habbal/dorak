# Task 71: Enable List Search and Filters

**Phase:** Phase 13 — Dashboard · **Priority:** P2 · **Depends on:** None · **Audit source:** Dashboard BFF/UI audit ("List search / filters — Stub UI"), verified in session

## Overview & Root Cause
Every dashboard entity list hard-codes `supportsSearch = false`, so the search input never renders. `dashboard.query.ts` already serialises `search`, `status`, `date_from`, `date_to`, `chair_id` and `stylist_id`, but only the overview page uses them. On the backend, `ListBookingsRequest` accepts `chair_id`, `date_from`, `date_to`, `status` and `stylist_id`, but no `search`. No dashboard resolver implements free-text search for branches, chairs, services or stylists.

## Evidence
- `frontend/dashboard/src/components/entities/entity-list-page.tsx:30` — `const supportsSearch = false;`.
- `frontend/dashboard/src/services/api/dashboard/dashboard.query.ts:13-18` — query params for search/status/date/chair/stylist.
- `backend/modules/Dashboard/Http/Requests/ListBookingsRequest.php` — rules: chair_id, date_from, date_to, per_page, status, stylist_id (no `search`).
- Grep for `search` under `backend/modules/Dashboard` finds nothing.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Add an optional `search` (string, max 100) to the dashboard list endpoints for branches, chairs, services and stylists. It matches on name/label, including translatable `name->en` / `name->ar` where applicable, and stays scoped to the actor's branch for managers.
- Bookings: keep the existing filters. Add `search` on client name/email only if the product wants it (Decision required).
### Dashboard (BFF / React)
- Replace the constant with a per-resource capability map in `dashboard-resource.constant.ts`.
- Debounce the search input (300 ms) and reset to page 1 on change. Query key includes the params: `["dashboard", resource, { page, search, …filters }]`.
- Bookings list gets status, date range, chair and stylist filters using the existing `dashboard.query.ts` params.
### Mobile (Flutter / Repositories)
- None.

## Acceptance Criteria
- [x] `GET /api/v1/dashboard/branches?search=foo` returns only matching branches. A manager never sees branches outside their scope. Feature test `DashboardListSearchTest` per resource. Implemented the same way for chairs (`label`), services and stylists (translated `name`) — `tests/Feature/Dashboard/DashboardListSearchTest.php` covers all four plus branch/stylist manager scoping.
- [x] `search` longer than 100 characters returns 422. Each resource now has its own `List{Resource}Request` FormRequest (branches/chairs/services/stylists had none before — their Actions took a plain `Request` with zero validation) with `search` => `nullable|string|max:100`; asserted in the same test file.
- [x] The search input renders on every list with search capability. Typing triggers one request after the debounce. New `DASHBOARD_RESOURCE_SEARCH_SUPPORT` capability map (`dashboard-resource.constant.ts`) replaces the `supportsSearch = false` constant; a new `useDebouncedValue` hook (300ms) feeds the query. RTL test with `vi.useFakeTimers` in `tests/components/entities/entity-list-page.test.tsx`.
- [x] Bookings list filters send `status`, `date_from`, `date_to`, `chair_id` and `stylist_id`, and the result updates. New `BookingListFilters` component (status Select + two date inputs + two ID inputs) wired into `EntityListPage` for `resource === "bookings"`; Vitest asserts `getDashboardList` is called with the expected params object.
- [x] `php artisan test` and `npm run test` pass; Pint is clean for touched backend files; eslint and tsc are clean. (PHPStan is out of gate scope for this repo per `backend/CLAUDE.md`.) Also ran `npm run build` — green.

### Implemented contract
- Backend: `ListBranchesQuery`/`ListChairsQuery`/`ListServicesQuery`/`ListStylistsQuery` each gained an `?string $search` parameter; the matching Eloquent resolvers add a `LIKE` filter (translated `name->en`/`name->ar` for branches/services/stylists, plain `label` for chairs — mirroring the existing precedent in `ServiceCatalog/Eloquent/Resolvers/Shared/ListCatalogItemsEloquentResolver.php`). Each of the four dashboard list Actions now type-hints a dedicated `Http/Requests/Business/List{Resource}Request` instead of a bare `Illuminate\Http\Request` (none existed before this task, so there was previously no `per_page`/`search` validation on these four endpoints at all).
- Dashboard: bookings intentionally does not get the generic search box (no backend `search` support was added for bookings — see the decision below); it gets the dedicated filter row instead.

## Out of Scope
- Explore/mobile text search (Task 43).
