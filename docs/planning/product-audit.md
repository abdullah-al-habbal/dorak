---
nodeid: docs.audit
parentnode: docs.graph
childnodes:
  - docs.audit.part-2
  - docs.audit.part-3
  - docs.audit.frontend
codeanchors:
  - backend/modules/
  - frontend/web/dashboard/src/
  - frontend/mobile/apps/
---

# Product Vision and Workflow Audit

> Role-by-role check that every workflow has a backend route **and** a UI. Dated 2026-11-03. Open product calls are tracked in [open decisions](../decisions-required.md).

Part 1 of 3 · [Matrix](product-audit-part-2.md) · [Findings](product-audit-part-3.md)

## Method

Three read-only explorers mapped the backend (265 API routes), the dashboard and the three Flutter apps. The highest-impact claims were then re-checked in code. **Confirmed** means verified directly; **reported** means found by an explorer only.

## Guards

- `client`, `barber`, `branch_api`, `admin_api` — Sanctum, used by the API.
- `admin`, `branch`, `barber_dashboard` — session guards, Filament panels only.
- A brand owner is a client with `brands.owner_id`; it signs in to the dashboard with `actor_type=owner`. There is no owner Filament panel.

## Surfaces

- Next.js dashboard: admin, owner, manager, barber.
- Filament: admin, branch and barber panels. Bans, activation logs, client management and brand records live here only.
- `client_app`, `business_app` (branch login) and `stylist_app` (barber login) are all real apps.

## Not found

- No TODO, FIXME or stub markers in PHP, TypeScript or Dart source.
- No mobile endpoint constant points at a missing backend route.
- English and Arabic mobile strings match (526 keys each).

## Headline result

The core booking loop works end to end for client, stylist, manager and owner. The gaps are around it: dispute handling, history media for stylists, brand verification, earnings visibility and launch readiness (SMS, branch access gating).
