---
nodeid: docs.mobile_audit_g10_g11.mvp_scope
parentnode: docs.mobile_audit_g10_g11
childnodes: []
codeanchors:
  - frontend/mobile/apps/business_app/
  - frontend/mobile/apps/stylist_app/
  - frontend/mobile/packages/core/
---

# 06: MVP scope decisions

Routes: [index](index.md) · [open decision](../decisions-required.md).

**Status:** Open. This note records the recommendation. It is **not** a resolved decision.

## Current coverage

| App | Area | Today |
|---|---|---|
| business_app | Services | Missing (mobile and backend) |
| business_app | Working hours | Missing (mobile) |
| business_app | Staff list | Missing (mobile and backend list) |
| business_app | Disputes | Done for reviews |
| business_app | Inbox | Missing UI |
| stylist_app | Past appointments | Missing (mobile and backend) |
| stylist_app | Services | Read-only list |
| stylist_app | Pricing | No UI |
| stylist_app | Inbox | Missing UI |
| stylist_app | Earnings | Missing (mobile, and token-scope blocked) |

> **Resolved:** the decision was full scope with zero deferrals (ADR 0002). Business services CRUD, stylist earnings and business earnings all shipped; the table below records the audit-time state.

## Recommendation (superseded)
**Ship:** working hours, staff list with activate and deactivate, notification inbox in both apps, stylist services and pricing editor, stylist past appointments.

**Defer:** business services CRUD and stylist earnings, unless the mobile-scoped backend routes in [02](02-token-scope-mismatch.md) are accepted as part of the MVP.

## To resolve
1. Confirm the ship and defer split.
2. Confirm the inbox definition ([03](03-inbox-scope-definition.md)).
3. Decide on earnings scope ([02](02-token-scope-mismatch.md)).

When resolved, update `docs/decisions-required.md` and record an ADR next to [ADR 0002](../adr/0002-mvp-scope-deferrals.md).
