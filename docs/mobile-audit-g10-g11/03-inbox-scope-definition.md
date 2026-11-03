---
nodeid: docs.mobile_audit_g10_g11.inbox_scope
parentnode: docs.mobile_audit_g10_g11
childnodes: []
codeanchors:
  - frontend/mobile/apps/business_app/
  - frontend/mobile/apps/stylist_app/
  - frontend/mobile/packages/core/
---

# 03: Inbox scope definition

Routes: [index](index.md).

**Status:** Proposed. Awaiting confirmation.

## Finding
The backend has no conversation, message or chat model, route or resource. The only inbox-like API is the notification feed in `backend/modules/Core/Routes/Api/V1/api_v1_routes.php`:

- `GET /notifications` (paginated, with `meta.unread_count`)
- `PATCH /notifications/{uuid}/read`
- `POST /notifications/read-all`

The guards allow `client`, `barber` and `branch_api`. Mobile core already has `NotificationRepository`, `NotificationEndpoints` and `NotificationDto`, which match the backend resource. Only `client_app` uses them.

## Proposed definition
"Inbox" in business_app and stylist_app means the notification feed, reusing the core client and the existing `notifications*` localization keys. Two-way messaging is out of scope for the MVP.

## Required follow-ups
- Confirm that definition.
- Verify whether `PaginatedData` exposes `meta.unread_count`; if not, add it to core.
- Replace the stub invite/application targets in `NotificationLocation` (both apps) with the real routes.
