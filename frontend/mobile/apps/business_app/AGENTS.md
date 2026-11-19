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

### Navigation shell and G10 features (2026-11-03)

`app.router.dart` uses a `StatefulShellRoute` with five tabs: `/operations`,
`/staff`, `/services`, `/inbox` (unread badge) and `/more`. Everything else
(`/hours`, `/earnings`, `/jobs`, `/floor-plan`, `/affiliations`, `/profile`, `/reviews`,
`/services/new`, `/services/:id/edit`, `/barbers/new`) is a top-level route
pushed over the shell. `refreshListenable` is core's `StaffSessionRefresh`, so a
logout or expired token re-runs the redirect immediately.

- **Staff list** (`GET /branch/barbers`, activate/deactivate through
  `ManagedBarberRepository`).
- **Services CRUD** (`/branch/services`, brand-owned; the brand id comes from
  `GET /branch/profile`). The backend returns the name in one locale, so the
  form re-asks for both.
- **Working hours** (`GET /branch/profile` `opening_hours`, `PUT
  /branch/opening-hours`). Hours overrides per date are not built.
- **Inbox** is the notification feed (`/notifications`); there is no two-way
  messaging. Invite notifications open `/affiliations`, application ones `/jobs`.
- **Earnings** (`GET /branch/earnings` via `DioEarningsRepository.branch`):
  per-currency gross, commission and net for this month or all time. Reached
  from the More tab at `/earnings`.

- **Brand owner experience (T16):** the login screen offers "Branch account" and
  "Brand owner". An owner signs in as a client (`/auth/login`); the role is kept in
  `AppRoleProvider` so the app reopens in the right shell. Owner routes live under `/owner`
  (brand home with the pending, rejected and suspended banners, branches, services, plan and
  payouts) on the `/owner/*` API through `DioOwnerRepository`. Owner registration stays on the
  website. A branch account never reaches `/owner/*` and an owner never reaches the branch shell.

Decision record: [ADR 0002](../../../../docs/adr/0002-mvp-scope-deferrals.md).

## Continued in

- [Part 2: 2. What it is meant to become](agents-part-2.md)
