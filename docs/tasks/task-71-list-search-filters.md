# Task 71: Enable List Search and Filters

**Phase:** Phase 13 — Dashboard · **Priority:** P2 · **Depends on:** None · **Audit source:** Dashboard BFF/UI audit ("List search / filters — Stub UI"), verified in session

## Overview & Root Cause
Every dashboard entity list hard-codes `supportsSearch = false`, so the search input never renders. `dashboard.query.ts` already serialises `search`, `status`, `date_from`, `date_to`, `chair_id` and `stylist_id`, but only the overview page uses them. On the backend, `ListBookingsRequest` accepts `chair_id`, `date_from`, `date_to`, `status` and `stylist_id`, but no `search`. No dashboard resolver implements free-text search for branches, chairs, services or stylists.

## Evidence
- `frontend/dashboard/new/src/components/entities/entity-list-page.tsx:30` — `const supportsSearch = false;`.
- `frontend/dashboard/new/src/services/api/dashboard/dashboard.query.ts:13-18` — query params for search/status/date/chair/stylist.
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
- [ ] `GET /api/v1/dashboard/branches?search=foo` returns only matching branches. A manager never sees branches outside their scope. Feature test `DashboardListSearchTest` per resource.
- [ ] `search` longer than 100 characters returns 422.
- [ ] The search input renders on every list with search capability. Typing triggers one request after the debounce. RTL test with fake timers.
- [ ] Bookings list filters send `status`, `date_from`, `date_to`, `chair_id` and `stylist_id`, and the result updates. Vitest asserts the query string.
- [ ] `php artisan test` and `npm run test` pass; PHPStan max and Pint are clean for touched backend files; eslint and tsc are clean.

## Out of Scope
- Explore/mobile text search (Task 43).
