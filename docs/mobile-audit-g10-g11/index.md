---
nodeid: docs.mobile_audit_g10_g11
parentnode: docs.graph.part-3
childnodes:
  - docs.mobile_audit_g10_g11.dto_is_active
  - docs.mobile_audit_g10_g11.token_scope
  - docs.mobile_audit_g10_g11.inbox_scope
  - docs.mobile_audit_g10_g11.navigation_shell
  - docs.mobile_audit_g10_g11.missing_backend_routes
  - docs.mobile_audit_g10_g11.mvp_scope
codeanchors:
  - frontend/mobile/apps/business_app/
  - frontend/mobile/apps/stylist_app/
  - frontend/mobile/packages/core/
  - backend/modules/
---

# Mobile Audit G10 / G11: Master Index

Routes: [documentation graph](../index.md) · [open decisions](../decisions-required.md) · [product audit findings](../planning/product-audit-part-3.md).

Read-only audit of `business_app`, `stylist_app` and `packages/core` against the backend, dated 2026-11-03. Findings come from reading code; the analyzer and full test suite were not run for the audit itself. Statuses below are updated as tasks close.

## Findings

| # | Finding | Priority | Status |
|---|---|---|---|
| 01 | [`BarberServiceDto` reads `active`, backend sends `is_active`](01-dto-is-active-bug.md) | High (data-correctness bug) | Fixed (Task 1) |
| 02 | [Dashboard routes unreachable with mobile tokens](02-token-scope-mismatch.md) | High (blocks features) | Open: needs a decision |
| 03 | [Inbox means the notification feed](03-inbox-scope-definition.md) | Medium | Proposed: awaiting confirmation |
| 04 | [No navigation shell in either app](04-navigation-shell-gap.md) | Medium | Open |
| 05 | [Missing backend endpoints](05-missing-backend-routes.md) | High | Open |
| 06 | [MVP scope decisions](06-mvp-scope-decisions.md) | Blocker | Open: awaiting product decision |

## Other findings (not yet split into their own notes)

- Notification deep links for invites and applications land on `/operations` (business_app) or `/home` (stylist_app) instead of the existing `/affiliations` and `/jobs/:id/applicants` screens.
- Files with more than one top-level class: `branch_operations.state.dart`, `manual_barber.event.dart`, `stylist_schedule.state.dart`.
- Repeated string literals for statuses, locale codes and error codes; raw spacing literals instead of `DorakDimensions`.
- Unchecked `results[n] as X` casts in the load blocs; `BookingStatus` throws on an unknown value.
- Unused ARB keys: `businessJobFieldRequired` and seven `stylist*` keys.
- Stale docs: both apps' `docs/feature-index.md` and the historical parts of their `agents-part-2.md` / `claude-part-2.md`.

## Task chain

1. Decide MVP scope ([06](06-mvp-scope-decisions.md)).
2. Fix the DTO bug ([01](01-dto-is-active-bug.md)). **Done.**
3. Notification inbox in both apps ([03](03-inbox-scope-definition.md)).
4. Navigation shell ([04](04-navigation-shell-gap.md)).
5. Business working hours.
6. Business staff list (needs backend route, see [05](05-missing-backend-routes.md)).
7. Stylist services and pricing editor.
8. Stylist past appointments (needs backend route).
9. Stylist earnings and business services, only if the scope decision accepts new mobile-scoped routes ([02](02-token-scope-mismatch.md)).
10. Convention cleanup and doc refresh.
