---
nodeid: docs.mobile_audit_g10_g11.missing_backend_routes
parentnode: docs.mobile_audit_g10_g11
childnodes: []
codeanchors:
  - frontend/mobile/apps/business_app/
  - frontend/mobile/apps/stylist_app/
  - frontend/mobile/packages/core/
---

# 05: Missing backend endpoints for mobile

Routes: [index](index.md).

**Status:** Open.

| Need | Existing route | Gap | Notes |
|---|---|---|---|
| Business staff list | `POST /branch/barbers`, activate and deactivate (`Activation/Routes/Api/V1/branch-activation.php`) | No `GET /branch/barbers`. The list exists only as `GET /dashboard/stylists`. | Add to the Branch module with a policy and tests. |
| Stylist past appointments | `GET /barber/appointments/today`, `GET /barber/clients/{client}/history` | No barber-scoped booking list with a history filter. | Add pagination and status or date filters. |
| Stylist earnings | `GET /dashboard/earnings` (`from`, `to`; response `scope`, `totals[]`) | Blocked for barber tokens, see [02](02-token-scope-mismatch.md). | Needs a `barber-app` route or a decision. |
| Business services | `/dashboard/services` CRUD | No `/branch/...` route. | Needs a decision, see [02](02-token-scope-mismatch.md). |
| Business hours (read) | `PUT /branch/opening-hours`, `PUT/DELETE /branch/hours-overrides/{date}` | No GET. | Reads can come from `GET /branch/profile` or branch detail. Verify before adding. |
| Messaging | none | No conversation or message API. | See [03](03-inbox-scope-definition.md). |

## Mobile core gaps
- No endpoint constants or DTOs for opening hours or hours overrides (read DTO only).
- No earnings DTO or repository.
- Branch affiliation invite mapping was not confirmed.

Rule: only add mobile route constants for routes that exist in the backend.
