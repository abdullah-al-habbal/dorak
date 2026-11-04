---
nodeid: docs.mobile_audit_g10_g11.token_scope
parentnode: docs.mobile_audit_g10_g11
childnodes: []
codeanchors:
  - frontend/mobile/apps/business_app/
  - frontend/mobile/apps/stylist_app/
  - frontend/mobile/packages/core/
---

# 02: Dashboard routes are inaccessible with mobile tokens

Routes: [index](index.md).

**Status:** Resolved: mobile-scoped routes (ADR 0002). Stylist earnings, business earnings and business services all use `barber-app` / `branch-app` routes and are implemented in the apps.

## Problem
Mobile logins issue tokens with the `branch-app` or `barber-app` ability (`backend/modules/Core/Enums/TokenAbility.php`; `Branch/Handlers/Branch/LoginHandler.php`, `Barber/Handlers/Barber/LoginHandler.php`). `EnforceTokenScope` blocks `api/v1/dashboard/*` unless the token carries the `dashboard` ability. Only `/notifications` and `/broadcasting/auth` are shared.

Every dashboard route is therefore a 403 `TOKEN_ABILITY_MISSING` for the mobile apps, including:

- `GET /dashboard/earnings` (the only earnings API; stylist scope)
- `/dashboard/services` (the only service CRUD for a branch)
- `GET /dashboard/stylists` (the only staff list)
- `/dashboard/payouts`

## Impact
The mobile features that depend on these (stylist earnings, business services, business staff list) cannot be built by only adding mobile code.

## Options
1. Add mobile-scoped routes (`/branch/...`, `/barber/...`) that reuse the existing Actions behind `auth:branch_api` / `auth:barber`, with their own policies and tests. Recommended: it matches how the other mobile routes work.
2. Grant mobile tokens the `dashboard` ability. Not recommended: it widens the token scope.
3. Keep these features dashboard-only and defer the screens.

Repository rules apply: do not invent endpoints in mobile; add the route in the backend first.
