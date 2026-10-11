# Task 11: Restrict BFF Catch-All Proxies to Declared Method+Path Pairs

**Phase:** 1 — Security & Authorization · **Priority:** P0 · **Depends on:** None · **Audit source:** Dashboard audit ("Broken Proxy" rows for both catch-all proxies)

## Overview & Root Cause
The dashboard BFF has two catch-all proxies that check the **path** but not the **HTTP method**:
- `isDashboardResourcePath` accepts any two-segment path `{root}/{id}` for any root, with any method.
- The barber proxy's `ALLOWED_PATHS` set matches paths regardless of method.

The BFF therefore forwards combinations the backend never defined, such as `DELETE bookings/{id}`, `PATCH branches/{id}`, `GET travel-radius` and `POST profile`. That widens the attack surface and produces 404 or 405 responses. No current caller sends these, but the allowlist's own comment says it must "never turn BFF into an open proxy".

## Evidence
- `frontend/dashboard/src/services/api/dashboard/dashboard-path.util.ts:8-29`: `(path[0] !== "overview" && path.length === 2)` is accepted regardless of method; the function takes no method parameter.
- `frontend/dashboard/src/app/api/barber/[...path]/route.ts:9`: `ALLOWED_PATHS` holds `profile`, `portfolio`, `schedule`, `appointments/today`, `travel-radius` and `workstation-status`.
- `frontend/dashboard/src/app/api/barber/[...path]/route.ts:13-16,21-23`: `GET`, `PATCH`, `POST` and `DELETE` all funnel into the same path-only check (a method check exists only for portfolio `DELETE`).

## Full-Stack Scope
### Backend (API / DB / Policies)
- None. The backend route table is the source of truth.

### Dashboard (BFF / React)
- Replace both allowlists with explicit `{ method, pattern }` tables that mirror the backend routes exactly:
  - **Dashboard proxy:** `GET`/`POST` on root collections where the backend defines them; `GET`/`PUT`/`DELETE` on `branches/{id}`, `chairs/{id}`, `services/{id}` and `stylists/{id}` (matching `backend/modules/Dashboard/Routes/Api/V1/dashboard.php`); `GET`/`PATCH` on `bookings/{id}`; `PATCH bookings/{id}/cancel|reschedule`; `POST bookings/walk-in`; the `profile` sub-routes.
  - **Barber proxy:**
    - `GET`/`PATCH profile`
    - `GET`/`POST portfolio`
    - `DELETE portfolio/{id}`
    - `GET`/`PATCH schedule`
    - `GET appointments/today`
    - `PATCH travel-radius`
    - `PATCH workstation-status`
    - `PATCH bookings/{id}/accept|start|complete|no-show`
    - `POST bookings/{id}/cancel`
- Change `isDashboardResourcePath(path)` to `isDashboardRouteAllowed(method, path)` and update `frontend/dashboard/src/app/api/dashboard/[...path]/route.ts` accordingly.
- Disallowed method+path combinations return 404 from the BFF without calling the backend.

### Mobile (Flutter / Repositories)
- None. Mobile apps call the backend directly.

## Acceptance Criteria
- [ ] Vitest table tests in `frontend/dashboard/tests/services/` assert, for each proxy, that every backend-defined method+path is allowed and that `DELETE bookings/{id}`, `PATCH branches/{id}`, `GET travel-radius`, `POST profile` and `PUT profile/x` are rejected.
- [ ] A rejected request makes no backend call (mocked `backendRequest` not invoked) and returns 404.
- [ ] All existing dashboard pages still work: the existing vitest suite passes, and every service in `frontend/dashboard/src/services/api/` uses only allowed pairs.
- [ ] Dashboard `npm run test` and `npm run lint` pass.

## Out of Scope
- New BFF routes for branch, admin or catalog features: Tasks 74–77.
- The `auth/refresh` caller: Task 73.
