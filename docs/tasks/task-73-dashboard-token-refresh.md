# Task 73: Implement Dashboard Token Refresh Flow

**Phase:** Phase 13 — Dashboard · **Priority:** P1 · **Depends on:** Task 10 · **Audit source:** Dashboard BFF/UI audit (`POST /api/auth/refresh` — Missing Client Hook)

## Overview & Root Cause
The BFF exposes `POST /api/auth/refresh`, but no client code calls it. Refresh happens only in `proxy.ts` during navigation, which calls `refreshDashboardSession` against the backend directly. Client-side `apiRequest` calls that get a 401 mid-session just report "session expired" without retrying. A user who stays on one page past the access-token TTL is logged out on the next mutation, even though they hold a valid refresh token.

## Evidence
- `frontend/dashboard/src/config/routes.constant.ts:42` — `refresh: "/api/auth/refresh"` is defined but not referenced outside its own route.
- `frontend/dashboard/src/proxy.ts:13,28-31` — navigation-time refresh via `refreshDashboardSession`.
- `frontend/dashboard/src/services/api/client.ts:54` — `if (auth === "session" && response.status === 401) reportSessionExpired();`, with no retry.
- `frontend/dashboard/src/app/api/auth/refresh/route.ts` — BFF handler with no caller.

## Full-Stack Scope
### Backend (API / DB / Policies)
- None. `POST /api/v1/dashboard/refresh` exists (throttled 10/min). Refresh-token rotation and claim hardening are in Task 10.
### Dashboard (BFF / React)
- In `services/api/client.ts`: on a 401 for `auth: "session"`, call `POST /api/auth/refresh` once (single-flight: concurrent 401s share one refresh promise), then retry the original request once. If the refresh fails, call `reportSessionExpired()`.
- Never retry the refresh call itself. Never retry non-idempotent requests that the backend has already processed (only retry after a 401).
### Mobile (Flutter / Repositories)
- None.

## Acceptance Criteria
- [x] With an expired access token and a valid refresh token, a client `apiRequest` succeeds transparently. Vitest with mocked fetch asserts the sequence 401 → refresh 200 → retry 200.
- [x] Three concurrent 401s trigger exactly one `POST /api/auth/refresh`. Vitest.
- [x] When the refresh returns 401, `reportSessionExpired` is called once and there is no retry loop. Vitest.
- [x] `ROUTES.api.auth.refresh` is referenced from `client.ts`.
- [x] `npm run test`, `npm run lint` and `npm run typecheck` pass.

### Implemented contract
- `services/api/core/client.ts`: on a 401 for `auth: "session"`, `refreshSession()` (single-flight via a shared in-flight promise, direct `fetch` to `ROUTES.api.auth.refresh` so it is never itself retried) runs once, then the original request is retried once. `reportSessionExpired()` fires only if the request is still 401 afterwards. Public requests never refresh. Tests in `tests/services/api/core/client.test.ts`. Backend/mobile unchanged.

## Out of Scope
- Session claim cookie/jti/rotation (Task 10).
- BFF proxy allowlists (Task 11).
