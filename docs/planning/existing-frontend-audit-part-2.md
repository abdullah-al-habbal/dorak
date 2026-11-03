---
nodeid: docs.audit.frontend.part-2
parentnode: docs.audit.frontend
childnodes: []
codeanchors:
  - backend/modules/Dashboard/Http/Middleware/
  - backend/modules/Dashboard/Support/DashboardActor.php
  - backend/modules/Dashboard/Routes/Api/V1/dashboard.php
---

# Backend Guards and Role Boundaries

Part 2 of 4 · [Previous](existing-frontend-audit.md) · [Next](existing-frontend-audit-part-3.md)

## Authentication chain

- `POST /api/v1/dashboard/login` (throttle 5/min) takes an actor type and credentials. `POST /refresh` is throttled to 10/min.
- Each actor type authenticates against its own model: Admin, Branch, Barber (needs `has_login`, not banned, enabled) and Owner (a Client, not banned).
- Owner login succeeds only if `DashboardOwnerActorResolver` finds an enabled, email-verified client who owns at least one brand. Brand and branch scope is rebuilt on every request.
- The token is a Sanctum token with ability `dashboard`. The `X-Dashboard-Session` claim header, when sent, must validate.
- `DashboardAuthorizationMiddleware` tries guards `admin_api`, `branch_api`, `barber`, `client` in that order and sets `dashboard_actor`.

## Middleware layers

| Middleware | Allows | Rejects |
| --- | --- | --- |
| `DashboardAuthorization` | any valid dashboard token | 401 |
| `DashboardAdminAuthorization` | Admin | everyone else, 403 |
| `DashboardBrandAuthorization` | Admin, Owner | Manager, Stylist |
| `DashboardOperationsAuthorization` | Admin, Owner, Manager | Stylist |

## Route groups

- Shared (any dashboard actor): `me`, `logout`, `profile`, email change and verify, password, notification preferences.
- Admin only, prefix `admin/`: reviews and dispute resolve, exchange rates, catalog items, categories, tags, subscription plans, subscriptions, platform settings, payment gateways, commission rules and entries, payouts, analytics.
- Admin and Owner: `brands` list, show, create, update.
- Admin, Owner, Manager: overview, bookings, branches, services, chairs, stylists, plus branch sub-resources (floor plan, reviews, affiliations, job postings, applications).
- Stylist has no `/dashboard/*` operations route. Stylist work goes to `/api/v1/barber/*` under `auth:barber` and `EnsureBarberAccountAccess`.

## Data scope (`DashboardActor`)

| Actor | `scopedBranchIds` | `scopedBrandIds` |
| --- | --- | --- |
| Admin | unrestricted | unrestricted |
| Manager | own branch | own branch's brand |
| Owner | branches of owned brands | owned brands |
| Stylist | none | none |

## Per-action rules beyond middleware (confirmed)

- Create brand: Owner only; Admin gets 403 (`brand_owner_only`). Show and update brand return 404 when not manageable.
- Create and delete branch: need `canManageBrand` (Admin or the owning Owner). A Manager cannot.
- Update branch: Admin, or an actor with branch access whose brand stays in scope.
- Create and update chair: `canAccessBranch(branch_id)`.
- Create stylist: a non-Admin must supply `chair_id`, otherwise 422. Brand subscription features are checked on the chair's branch.
- Create and update service: Admin, or a service with `serviceable_type=brand` where `canManageBrandServices` holds (Owner of the brand, or the Manager of a branch in that brand).
- Walk-in booking: `canAccessBranch`. Booking client review: Admin gets 403; others review within scoped branches.
- Admin-only areas also include catalog mutations (ADR 0002).

## Notable backend characteristics

- The Owner role has no table of its own; it is a derived capability on a Client.
- `permissions` returned by `/me` are the token abilities (`dashboard`), not fine-grained rights.
- Authorization is resolver-level: list and show queries receive the scoped id lists.
