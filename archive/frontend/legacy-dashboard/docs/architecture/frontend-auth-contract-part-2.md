---
nodeid: archive.legacy_dashboard.auth_contract.part-2
parentnode: archive.legacy_dashboard.auth_contract
childnodes: []
codeanchors:
  - archive/frontend/legacy-dashboard/src/proxy.ts
  - archive/frontend/legacy-dashboard/src/services/api/
---

Part 2 of 3 · [Frontend authentication and portal contract](frontend-auth-contract.md) · [Previous](frontend-auth-contract.md) · [Next](frontend-auth-contract-part-3.md)

## Backend endpoints used

| Endpoint                    | Method | Auth                            | Purpose                                 |
| --------------------------- | ------ | ------------------------------- | --------------------------------------- |
| `/api/v1/dashboard/login`   | POST   | none (throttle 5/min)           | Issue claim + access + refresh tokens   |
| `/api/v1/dashboard/refresh` | POST   | refresh token (throttle 10/min) | Rotate refresh + issue new claim/access |
| `/api/v1/dashboard/me`      | GET    | `dashboard` ability             | Canonical identity + permissions        |
| `/api/v1/dashboard/logout`  | POST   | `dashboard` ability             | Revoke access + refresh tokens          |
| `/health`                   | GET    | none                            | Public backend availability probe       |

Login body: `{ actor_type: "admin" | "branch" | "barber" | "owner", email, password }`.
The shared response envelope is `{ success, statusCode, code, message, timestamp, data, ... }`.

## Claim

`proxy.ts` verifies the claim locally with `crypto.subtle` (HS256, shared
`DASHBOARD_SESSION_SECRET`), no third-party JWT library. Payload:

```json
{
  "actor_type": "admin | branch | barber | owner",
  "role": "platform_admin | branch_manager | barber | brand_owner",
  "sub": "<actor uuid>",
  "branch_id": "<branch uuid, omitted for admin/barber/owner>",
  "brand_id": "<owner only: first owned brand>",
  "brand_ids": ["<owner only: every owned brand>"],
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
| `brandIds`                     | Owned brands for `brand_owner` actors, otherwise `[]`      |
| `permissions`                  | Token abilities for presentation and server authorization  |
| `displayName` / `email`        | Header/profile presentation                                |
| `claimExpiresAt`               | Expiry derived from the verified claim                     |
