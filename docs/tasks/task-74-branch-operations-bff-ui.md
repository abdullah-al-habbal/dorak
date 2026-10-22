# Task 74: Add Branch Operations BFF and UI

**Phase:** Phase 13 — Dashboard · **Priority:** P2 · **Depends on:** Task 11, Task 18, Task 27, Task 51 · **Audit source:** Dashboard BFF/UI audit ("Branch module — 19 routes with no proxy"; "Shared branch views")

## Overview & Root Cause
The backend exposes a full branch-manager API under `/api/v1/branch/*` (`auth:branch_api`) and shared branch views. The dashboard proxies none of them: `DASHBOARD_PROXY_ROOTS` only covers the `dashboard/*` module. Branch profile, the floor-plan editor, the chair status toggle and branch reviews therefore have no dashboard UI, although their backend routes exist. This task covers the operational half of the branch module. People-related routes are in Task 75.

## Evidence
- `backend/modules/Branch/Routes/Api/V1/branch.php:29-47` — `auth:branch_api` group: `dashboard`, `profile` (GET/PATCH), `floor-plan` (PATCH), `chairs/{chair}/status` (PATCH), `bookings` (+`{booking}/status`), `chairs`, `reviews`, plus people routes.
- `backend/modules/Branch/Routes/Api/V1/floor-plan.php:8` — `GET /branches/{branch}/floor-plan` (public).
- `backend/modules/Chair/Routes/Api/V1/chairs.php:12` — `GET /branches/{branch}/chairs`.
- `backend/modules/Review/Routes/Api/V1/reviews.php:20` — `GET /branches/{branch}/reviews`.
- `frontend/dashboard/src/services/api/dashboard/dashboard-resource.constant.ts` — proxy roots: overview, branches, chairs, services, stylists, bookings, profile.
- `backend/modules/Dashboard/Handlers/DashboardLoginHandler.php:26-34` — manager dashboard tokens are Sanctum tokens on the branch model with ability `dashboard`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Decision required: **(a)** proxy `/api/v1/branch/*` directly with the manager's dashboard token (Sanctum, branch provider), or **(b)** add equivalent endpoints to the `Dashboard` module behind `DashboardOperationsAuthorizationMiddleware` so that admins can also use them for any branch. Recommended: (b) for floor plan, profile and reviews, so admin and manager share one contract and one policy. Whichever is chosen, a feature test must prove the token or guard works end to end.
- No duplicate status endpoint: booking status changes go through the Task 18 lifecycle service only.
- Floor-plan payload completeness (`backend/docs/06_entity-model-abstract.md:153-156`): the floor plan must carry a canvas size (width/height/unit) and static decoration components (waiting area, mirror, etc.) alongside chairs. Today `GET /branches/{branch}/floor-plan` returns only preset, zones and chairs. Extend `PATCH branch/floor-plan` to accept `canvas` and `decorations`, and extend the GET response. Decision required: whether these are persisted (e.g. in the branch's floor-plan configuration) or computed. The spec leaves it open.
### Dashboard (BFF / React)
- BFF: add exact method+path entries (per Task 11) for the chosen endpoints only.
- Pages under `app/(portals)/manager/` (and `admin/` if option b): Branch profile (view/edit), Floor plan (view chairs and zones; edit layout via PATCH floor-plan), Chairs (status toggle available/maintenance with the conflict warning from Task 27), and Reviews (paginated list).
- Query keys `["dashboard","branch-profile"]`, `["dashboard","floor-plan",branchId]` and `["dashboard","branch-reviews",branchId]`. Every mutation invalidates its key plus `["dashboard","chairs"]` where chairs change.
- Add nav entries in `PORTAL_NAVIGATION` (`config/routes.constant.ts`) for the new pages.
### Mobile (Flutter / Repositories)
- None. The business app equivalents are in Task 85.

## Acceptance Criteria
- [ ] Manager can view and edit the branch profile. PATCH returns 200 and a reload shows the new values. A manager cannot edit another branch (403 or 404, feature test).
- [ ] Floor plan page renders chairs from the API. Saving a layout sends PATCH and returns 200; an invalid payload shows the backend 422 field errors.
- [ ] `GET /api/v1/branches/{branch}/floor-plan` returns `canvas` {width, height, unit} and a `decorations` array. A PATCH with an invalid canvas returns 422 (feature test). The editor renders the decorations and saves them.
- [ ] Toggling a chair to maintenance while it has future bookings shows the Task 27 conflict response, and does not silently succeed.
- [ ] Branch reviews page lists the reviews returned by the API, paginated.
- [ ] BFF rejects any method/path not declared for these endpoints with 404 or 405. Vitest per route.
- [ ] `php artisan test` and `npm run test` pass; eslint and tsc are clean.

## Out of Scope
- Affiliations, job postings and managed barbers (Task 75).
- Review dispute resolution (Task 76).

> Note (Task 41): the manager "Dispute" action calls `POST /api/v1/branch/reviews/{review}/dispute` (`reason` 10–1000) — or add a dashboard-scoped equivalent for brand owners.
