---
nodeid: dashboard.auth_contract
parentnode: dashboard.guide
childnodes:
  - dashboard.architecture
  - backend.docs
codeanchors:
  - frontend/dashboard/src/proxy.ts
  - frontend/dashboard/src/services/api/
---

# Frontend authentication and portal contract

Routes: [dashboard guide](../../AGENTS.md) · [documentation graph](../../../../docs/INDEX.md) · [work tracker](../../../../docs/todowork.md).

## Status

Implemented in Phase 2 against the real backend. This document is the source of
truth for the frontend/backend auth boundary. Backend additions that make this
contract possible are recorded in `backend-additions.md`.

## Actors and portal mapping

| Backend actor type | Backend guard | Frontend actor | Canonical portal | Login route      |
| ------------------ | ------------- | -------------- | ---------------- | ---------------- |
| `admin`            | `admin_api`   | `admin`        | `/admin`         | `/admin/login`   |
| `branch`           | `branch_api`  | `manager`      | `/manager`       | `/manager/login` |
| `barber`           | `barber`      | `barber`       | `/barber`        | `/barber/login`  |

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

## Backend endpoints used

| Endpoint                    | Method | Auth                            | Purpose                                 |
| --------------------------- | ------ | ------------------------------- | --------------------------------------- |
| `/api/v1/dashboard/login`   | POST   | none (throttle 5/min)           | Issue claim + access + refresh tokens   |
| `/api/v1/dashboard/refresh` | POST   | refresh token (throttle 10/min) | Rotate refresh + issue new claim/access |
| `/api/v1/dashboard/me`      | GET    | `dashboard` ability             | Canonical identity + permissions        |
| `/api/v1/dashboard/logout`  | POST   | `dashboard` ability             | Revoke access + refresh tokens          |
| `/health`                   | GET    | none                            | Public backend availability probe       |

Login body: `{ actor_type: "admin" | "branch" | "barber", email, password }`.
The shared response envelope is `{ success, statusCode, code, message, timestamp, data, ... }`.

## Claim

`proxy.ts` verifies the claim locally with `crypto.subtle` (HS256, shared
`DASHBOARD_SESSION_SECRET`), no third-party JWT library. Payload:

```json
{
  "actor_type": "admin | branch | barber",
  "role": "platform_admin | branch_manager | barber",
  "sub": "<actor uuid>",
  "branch_id": "<branch uuid, omitted for admin/barber>",
  "iat": 0,
  "exp": 0,
  "iss": "dorak-backend"
}
```

## Session shape

`GET /dashboard/me` is the canonical identity source. `permissions` are the
Sanctum token abilities (there are no spatie roles on the dashboard actors).

| Field                          | Purpose                                                    |
| ------------------------------ | ---------------------------------------------------------- |
| `subject`                      | Stable authenticated principal ID                          |
| `actor` / `actorType` / `role` | Active actor and backend role                              |
| `branchId`                     | Branch scope for `branch_manager` actors, otherwise `null` |
| `permissions`                  | Token abilities for presentation and server authorization  |
| `displayName` / `email`        | Header/profile presentation                                |
| `claimExpiresAt`               | Expiry derived from the verified claim                     |

## Route behavior

| Route            | Requirement                        | Behavior                            |
| ---------------- | ---------------------------------- | ----------------------------------- |
| `/`              | Public                             | Landing page                        |
| `/{actor}/login` | Public (redirects in if signed in) | Sign-in entry                       |
| `/admin/*`       | `admin` session                    | Redirect to active portal otherwise |
| `/manager/*`     | `manager` session                  | Redirect to active portal otherwise |
| `/barber/*`      | `barber` session                   | Redirect to active portal otherwise |
| `/profile/*`     | Any valid session                  | Accessible to every actor           |
| `/forbidden`     | Public                             | Access-denied explanation           |

## Proxy responsibilities (`src/proxy.ts`)

1. Bypass `/api/*` and public paths.
2. Verify the claim cookie locally.
3. On missing/expired claim, attempt a single refresh via
   `/dashboard/refresh`; on success set the new cookies and redirect to the
   same URL so the next request carries them.
4. Redirect unauthenticated protected requests to the actor login with a
   validated `callbackUrl`.
5. Redirect signed-in users away from login routes, and cross-portal requests
   back to their own portal.
6. Fail closed: an unreachable backend or invalid claim is treated as no
   session.

## Login callbacks

`callbackUrl` is accepted only when it is a single-slash-local path, contains no
scheme or backslash, and lives under the actor's portal or `/profile`.

## Deliberate limitation

Verifying the claim in `proxy.ts` requires the shared HS256 secret to be present
in the Next.js server environment; the Next server can therefore forge claims.
This is accepted for Phase 2. The authoritative identity is still fetched from
`/dashboard/me` with the access token in protected server renders.
