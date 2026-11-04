---
nodeid: docs.decisions
parentnode: docs.graph
childnodes:
  - docs.adr_0001
  - docs.adr_0002
  - docs.adr_0003
  - docs.feature_modules_plan
codeanchors:
  - backend/modules/
  - frontend/dashboard/src/
  - frontend/mobile/apps/
---

# Open Product Decisions

Routes: [documentation graph](index.md).

> Only unresolved product decisions live here; resolved ones are removed once implemented. Standing records: [ADR 0001: brand owner as client](adr/0001-brand-owner-as-client.md), [ADR 0002: MVP scope deferrals](adr/0002-mvp-scope-deferrals.md), [ADR 0003: new dashboard foundation](adr/0003-new-dashboard-foundation.md).

Source: [product audit](planning/product-audit-part-3.md). Remaining launch-readiness items need engineering, not a product call.

## New dashboard feature modules

Plan: [feature modules master plan](feature-modules-plan.md) (sections 4 and 12). The plan was checked against the backend routes and Form Requests; these items differ from the original brief and need an answer before the affected module starts.

- [ ] Barber URL segment: the backend resource is `stylists` and the dashboard nav already uses `stylists`. Keep `/dashboard/[guard]/stylists` with the label "Barbers", or rename the segment to `barbers`.
- [ ] Working hours have no endpoint of their own: they are `opening_hours` on `PUT /branches/{id}`, one interval per day, no split shifts. Confirm that a partial payload is accepted, or that the dashboard must send the whole branch.
- [ ] Earnings response shape (splits, previous-period figure, paging) is not documented; confirm `GET /earnings` before building trend indicators.
- [ ] Barbers are rejected by every Operations route, so the barber portal can only show earnings. Decide whether a barber-scoped bookings/schedule endpoint is wanted (backend work).
- [ ] Approve or reject adding a chart library for earnings (none is installed).
