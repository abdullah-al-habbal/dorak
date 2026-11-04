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

Resolved 2026-11-04 (session handover). Remove each entry once its module ships.

- [x] **Barber URL segment:** the dashboard uses the backend name directly: `/dashboard/[guard]/stylists` calls `/stylists`. The UI label stays "Barbers". No path mapping exists in the proxy. The `/barbers/{barber}/services` override routes are a separate Brand-group resource for Module 3.
- [x] **Working hours:** edited through `opening_hours` on `PUT /branches/{id}`. Verified in `BranchRequest`: `brand_id`, `name.en`, `name.ar` and `email` are required, so a partial payload is rejected. The editor loads the branch and sends the whole object with the changed hours. One interval per day, no split shifts.
- [x] **Booking statuses:** audited against the backend; all six `BookingStatus` values are live (`pending`, `confirmed`, `in_progress`, `completed`, `cancelled`, `no_show`). Transitions: pending to confirmed or cancelled; confirmed to in_progress, cancelled or no_show; in_progress to completed, cancelled or no_show; the other three are terminal. `PATCH /bookings/{id}` rejects `pending` as a target, so the UI offers only graph-valid transitions.
- [x] **Barber portal scope:** earnings only, because the Operations routes reject barbers. The "schedule" item stays marked "Soon" until a barber-scoped endpoint exists (backend work, not in this effort).
- [x] **Earnings shape and CSV:** `GET /earnings` accepts only `from` and `to` and returns `{scope, totals[]}`, with no previous-period figure and no paging. Trends come from a second request for the equal preceding range. CSV export is generated client-side from loaded rows.
- [ ] Approve or reject adding a chart library for earnings (none is installed). Still open: not covered by the handover brief.
