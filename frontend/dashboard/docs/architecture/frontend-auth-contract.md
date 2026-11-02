---
nodeid: dashboard.auth_contract
parentnode: dashboard.guide
childnodes:
  - dashboard.backend_additions
  - dashboard.auth_contract.part-2
  - dashboard.auth_contract.part-3
codeanchors:
  - frontend/dashboard/src/proxy.ts
  - frontend/dashboard/src/services/api/
---

# Frontend authentication and portal contract

Routes: [dashboard guide](../../AGENTS.md) · [documentation graph](../../../../docs/index.md).

## Status

Implemented in Phase 2 against the real backend. This document is the source of
truth for the frontend/backend auth boundary. Backend additions that make this
contract possible are 
The active actor is derived from the signed claim, never from the URL. A request
to another actor's portal redirects to the active actor's portal.

recorded in `backend-additions.md`.

## Actors and portal mapping

| Backend actor type | Backend guard | Frontend actor | Canonical portal | Login route      |
| ------------------ | ------------- | -------------- | ---------------- | ---------------- |
| `admin`            | `admin_api`   | `admin`        | `/admin`         | `/admin/login`   |
| `branch`           | `branch_api`  | `manager`      | `/manager`       | `/manager/login` |
| `barber`           | `barber`      | `barber`       | `/barber`        | `/barber/login`  |
| `owner`            | `client`      | `owner`        | `/owner`         | `/owner/login`   |

The active actor is derived from the signed claim, never from the URL. A request
to another actor's portal redirects to the active actor's portal.

## Transport

- All backend calls are made server-side from Next.js route handlers / server
  components using `BACKEND_API_URL`. The browser never talks to the backend
  directly, so no CORS configuration is needed.
- The backend login returns a signed claim, a Sanctum personal access token, and
  a rotating opaque refresh token. All three are stored in HttpOnly cookies
  (`SameSite=Lax`, `Secure` in production, `path=/`):

| Cookie              | Contents                                            | TTL                        |
| ------------------- | --------------------------------------------------- | -------------------------- |
| `dashboard_claim`   | HS256 JWT session claim                             | 8h (`expires_in`)          |
| `dashboard_access`  | Sanctum personal access token (ability `dashboard`) | 8h                         |
| `dashboard_refresh` | Opaque, single-use, rotating refresh token          | 30d (`refresh_expires_in`) |

- No secret is ever exposed to the browser: there is no `NEXT_PUBLIC_` auth
  variable. `DASHBOARD_SESSION_SECRET` and `BACKEND_API_URL` are server-only.

## Continued in

- [Part 2: Backend endpoints used](frontend-auth-contract-part-2.md)
- [Part 3: Route behavior](frontend-auth-contract-part-3.md)
