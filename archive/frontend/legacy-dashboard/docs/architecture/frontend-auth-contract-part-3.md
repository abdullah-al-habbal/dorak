---
nodeid: archive.legacy_dashboard.auth_contract.part-3
parentnode: archive.legacy_dashboard.auth_contract
childnodes: []
codeanchors:
  - archive/frontend/legacy-dashboard/src/proxy.ts
  - archive/frontend/legacy-dashboard/src/services/api/
---

Part 3 of 3 · [Frontend authentication and portal contract](frontend-auth-contract.md) · [Previous](frontend-auth-contract-part-2.md)

## Route behavior

| Route            | Requirement                        | Behavior                            |
| ---------------- | ---------------------------------- | ----------------------------------- |
| `/`              | Public                             | Landing page                        |
| `/{actor}/login` | Public (redirects in if signed in) | Sign-in entry                       |
| `/admin/*`       | `admin` session                    | Redirect to active portal otherwise |
| `/manager/*`     | `manager` session                  | Redirect to active portal otherwise |
| `/barber/*`      | `barber` session                   | Redirect to active portal otherwise |
| `/owner/*`       | `owner` session                    | Redirect to active portal otherwise |
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
