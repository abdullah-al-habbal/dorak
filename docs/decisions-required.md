---
nodeid: docs.decisions
parentnode: docs.graph
childnodes:
  - docs.adr_0001
  - docs.adr_0002
  - docs.adr_0003
  - docs.adr_0004
  - docs.feature_modules_plan
codeanchors:
  - backend/modules/
  - frontend/web/dashboard/src/
  - frontend/mobile/apps/
---

# Open Product Decisions

Routes: [documentation graph](index.md).

> Only unresolved product decisions live here; resolved ones are removed once implemented. Standing records: [ADR 0001: brand owner as client](adr/0001-brand-owner-as-client.md), [ADR 0002: MVP scope deferrals](adr/0002-mvp-scope-deferrals.md), [ADR 0003: dashboard foundation](adr/0003-new-dashboard-foundation.md), [ADR 0004: archive the first dashboard](adr/0004-archive-legacy-dashboard.md).

Source: [product audit](planning/product-audit-part-3.md). Remaining launch-readiness items need engineering, not a product call.

## Dashboard feature modules

Plan: [feature modules master plan](feature-modules-plan.md) (sections 4 and 12). The plan was checked against the backend routes and Form Requests; these items differ from the original brief and need an answer before the affected module starts.

Resolved 2026-11-04 (session handover). Remove each entry once its module ships.

- [x] **Barber URL segment:** the dashboard uses the backend name directly: `/dashboard/[guard]/stylists` calls `/stylists`. The UI label stays "Barbers". No path mapping exists in the proxy. The `/barbers/{barber}/services` override routes are a separate Brand-group resource for Module 3.
- [x] **Working hours:** edited through the dedicated `GET|PUT /branches/{id}/opening-hours` endpoint (a partial `PUT /branches/{id}` is rejected, so the editor does not use it). Resolved 2026-11-05: split shifts are supported (up to four non-overlapping shifts per day); the response keeps `opens_time`/`closes_time` as the day's span and adds `shifts`, so mobile builds that predate shifts keep working. Dated overrides stay single-interval.
- [x] **Booking statuses:** audited against the backend; all six `BookingStatus` values are live (`pending`, `confirmed`, `in_progress`, `completed`, `cancelled`, `no_show`). Transitions: pending to confirmed or cancelled; confirmed to in_progress, cancelled or no_show; in_progress to completed, cancelled or no_show; the other three are terminal. `PATCH /bookings/{id}` rejects `pending` as a target, so the UI offers only graph-valid transitions.
- [x] **Barber portal scope:** earnings plus a read-only schedule. The Operations routes reject barbers, so resolved 2026-11-07 with barber-only `GET /dashboard/schedule/appointments` and `GET /dashboard/schedule/hours`. Booking actions and hours editing stay in the stylist app; weekly hours allow one shift per weekday (unique key).
- [x] **Earnings shape and CSV:** `GET /earnings` accepts `from` and `to`. Resolved 2026-11-05: it keeps `{scope, totals[]}` and adds `series[]` (per day and currency: `date, currency_code, gross_minor, completed_bookings_count`), `previous_period` and `previous_totals[]` (the equal range just before; null without a full range), so trends need no second request. No paging. CSV export is generated client-side from loaded rows.
- [x] **Earnings charts:** no chart library. Bars are flex rows of Tailwind elements (`components/earnings/bar-chart.tsx`), so RTL, light/dark and `prefers-reduced-motion` follow the page with no dependency. Resolved 2026-11-05.
- [x] **Branches module (owner and admin):** resolved 2026-11-07. The existing `/dashboard/branches` CRUD is used as-is; the only backend change is the optional `status` and `brand_id` list filters. Create and delete are for admins and brand owners (the proxy mirrors `canManageBrand`; branch managers still edit their own branch from Working hours). A brand cannot be changed on an existing branch from the dashboard. Opening hours, tags and the floor plan are not part of the branch form. A brand's plan without `multi_branch` answers 403 `feature_not_enabled` on adding another branch, which the form explains. Brands, the admin catalog and platform settings stay "Soon" (admin payouts and plans shipped as Module 9).
- [x] **Admin payouts and plans (Module 9):** resolved 2026-11-07. The existing `/dashboard/admin/payouts`, `/subscription-plans` and `/subscriptions` endpoints are used as they are; the backend only gains row-locked status changes and the `status` (subscriptions) and `is_active` (plans) list filters. Payouts reuse the `payouts` nav entry (the screen depends on the guard); plans and brand subscriptions are two admin entries. A payout move asks for optional notes, and a transfer reference when marking paid. Plan prices are typed in major units. Commission rules, payment gateways, settings and analytics stay "Soon".
