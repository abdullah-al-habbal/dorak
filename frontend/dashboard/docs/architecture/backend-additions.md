---
nodeid: dashboard.backend_additions
parentnode: dashboard.auth_contract
childnodes: []
codeanchors:
  - backend/modules/Dashboard/
  - backend/modules/Core/
---

# Backend additions for the dashboard auth bridge

Routes: [dashboard auth contract](frontend-auth-contract.md) · [documentation graph](../../../../docs/index.md).

Phase 2 added a small, additive surface to the backend to support three
first-class dashboard actors (admin, branch manager, barber) with refreshable
sessions. No existing behaviour was removed.

## Actors

- `DashboardActor` now carries an explicit `actor_type` (`admin`, `branch`,
  `barber`) in addition to `role` and `branch_id`.
- `DashboardSessionClaim::issue()` emits `actor_type` from the actor instead of
  deriving it from the role.
- The barber actor type was added to `DashboardLoginRequest` validation and to
  `DashboardLoginHandler` (login requires `has_login = true` and an `enabled`
  status).

## Endpoints

| Route                       | Method | Middleware                         | Notes                                                     |
| --------------------------- | ------ | ---------------------------------- | --------------------------------------------------------- |
| `/api/v1/dashboard/login`   | POST   | `throttle:5,1`                     | Now also returns `refresh_token` and `refresh_expires_in` |
| `/api/v1/dashboard/refresh` | POST   | `throttle:10,1`                    | New; rotates the opaque refresh token                     |
| `/api/v1/dashboard/me`      | GET    | `DashboardAuthorizationMiddleware` | New; canonical identity + token abilities                 |
| `/api/v1/dashboard/logout`  | POST   | `DashboardAuthorizationMiddleware` | New; revokes access + refresh tokens                      |

## Refresh tokens

- Migration `dashboard_refresh_tokens`: `actor_type`, `actor_id` (uuid),
  `guard`, `token_hash` (sha256, unique), `expires_at`, `revoked_at`,
  `replaced_by_id`.
- `DashboardRefreshTokenResolver` issues, single-use rotates, and revokes
  tokens. Rotation happens in a transaction with `lockForUpdate`.
- TTL is `DASHBOARD_REFRESH_TTL_SECONDS` (default `2592000` = 30 days).
- Access/claim TTL remains `DASHBOARD_CLAIM_TTL_SECONDS` (default `28800` = 8h);
  the Sanctum token now receives an explicit expiry instead of never expiring.

## Authorization

`DashboardAuthorizationMiddleware` accepts the `admin_api`, `branch_api`, and
`barber` guards. When a personal access token is present it must carry the
`dashboard` ability; session-authenticated principals (no access token) are
accepted for backward compatibility with existing tests. On success it stashes
`dashboard_actor`, `dashboard_guard`, `dashboard_model`, and `dashboard_token`
on the request for downstream actions.

## Environment

- `DASHBOARD_REFRESH_TTL_SECONDS=2592000` added to `.env.example`.
- `DASHBOARD_SESSION_SECRET` must be shared with the frontend server
  environment.

## Tests

`tests/Feature/Dashboard/DashboardAuthApiTest.php` covers barber login, disabled
barbers, `/me` identity and abilities for each actor, missing-ability rejection,
refresh rotation/replay, expired refresh tokens, and logout revocation. Full
backend suite: 550 passing.
