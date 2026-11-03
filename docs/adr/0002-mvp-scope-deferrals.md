---
nodeid: docs.adr_0002
parentnode: docs.decisions
childnodes: []
codeanchors:
  - backend/modules/ServiceCatalog/
  - backend/modules/Client/
  - frontend/mobile/apps/client_app/
---

# ADR 0002 — MVP scope: catalog admin-only, no freelancer booking, no social login

Status: `ACCEPTED` (Tasks 04, 79, 81, G10/G11, 2026-11-03)

## Decision

- **Task 04 — catalog mutations are admin-only.** Create, update and delete
  stay behind `auth:admin_api` and the dashboard admin middleware. Branches
  and clients are rejected. Branch-proposed items would need a separate
  approval endpoint and are not planned for the MVP.
- **Task 79 — freelancer-only booking is deferred.** Barbers without a branch
  workplace keep the disabled booking CTA and its hint, because
  `BranchDetailBloc` requires a branch. A dedicated at-home booking screen is
  post-MVP.
- **Task 81 — social login is deferred.** `POST /client/social/{provider}`
  remains in the backend but is not exposed: the client app ships no
  Google/Apple SDK or login buttons, and no provider credentials are
  configured. Revisit with both providers together, since iOS requires Apple
  sign-in when another social login is offered.
- **Gap G10/G11 — business and stylist apps ship full scope, no deferrals.**
  business_app: services CRUD, working hours, staff list with
  activate/deactivate, notification inbox. stylist_app: past appointments,
  services and pricing editor, earnings, notification inbox. "Inbox" is the
  notification feed (`/notifications`); two-way messaging stays out of scope.
  Mobile tokens keep the `branch-app` / `barber-app` ability and are **not**
  granted `dashboard`; instead mobile-scoped routes (`/branch/services`,
  `/branch/barbers`, `/barber/earnings`, `/barber/appointments`) reuse the
  dashboard Actions behind `auth:branch_api` / `auth:barber`, with the actor
  derived from the authenticated model (audit options 1 of note 02).

## Consequences

- Reopening any of these needs a new decision record and a full-stack slice.
- The unused social endpoint keeps its tests; do not add UI without the SDKs.
