---
nodeid: mobile.apps.business-app
parentnode: mobile.guide
childnodes:
  - mobile.apps.business-app.claude
  - mobile.apps.business-app.feature-index
  - mobile.apps.business-app.readme
  - mobile.apps.business-app.part-2
codeanchors:
  - frontend/mobile/apps/business_app/lib/
---

# AGENTS.md — `apps/business_app`

**Status (2026-11-03): a working branch-manager app.** It signs in through
`POST /branch/login` (`auth:branch_api`) and covers day-to-day operations.

Parent: [`../../AGENTS.md`](../../AGENTS.md) · Rules: [`CLAUDE.md`](./CLAUDE.md)
· Files: [`docs/feature-index.md`](./docs/feature-index.md)

---

## 1. What is actually here

```
lib/main.dart                         bootstrap: dotenv, then DorakBusinessApp
lib/app.dart                          DI, StaffSessionBloc, realtime, push
lib/src/core/navigation/              go_router + app_routes.entity.dart
lib/src/features/                     affiliations, auth, barbers, floor_plan,
                                      jobs, operations, profile, reviews, shared
```

Routes: `/login`, `/operations` (dashboard, bookings, chairs), `/barbers/new`,
`/floor-plan` (preset only), `/affiliations`, `/jobs` (+ `/new`, edit,
applicants), `/profile`, `/reviews` (lists reviews; a manager can dispute a published
one with a reason of 10–1000 characters via `POST /branch/reviews/{review}/dispute`).

It depends on `core`, `design_system` and `localization`.

**Not built yet** (the backend routes mostly exist): opening hours and hours
overrides, services and pricing, a staff list, settings and
the notification inbox. See the
[product audit](../../../../docs/planning/product-audit-part-3.md), G10.

## Continued in

- [Part 2: 2. What it is meant to become](agents-part-2.md)
