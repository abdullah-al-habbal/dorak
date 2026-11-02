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

Status: `ACCEPTED` (Tasks 04, 79, 81, 2026-11-03)

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

## Consequences

- Reopening any of these needs a new decision record and a full-stack slice.
- The unused social endpoint keeps its tests; do not add UI without the SDKs.
