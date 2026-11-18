---
nodeid: docs.readiness.t05
parentnode: docs.readiness
childnodes: []
codeanchors:
  - frontend/web/dashboard/src/
---

# T5. Dashboard support inbox

Status: todo · Phase 3 · Depends on: T4 · Reuses: the shared list-screen pattern and `tests/helpers/list-screen.helper.tsx`

- [ ] T5.1 List screen with filters by kind, app, platform and status.
- [ ] T5.2 Detail dialog: source context shown separately from the related entity; status and note editing.
- [ ] T5.3 Proxy allow-list entry, route, navigation item, EN and AR strings.

Tests: Vitest list states and dialog; one Playwright smoke spec.
Acceptance: an admin can filter, read and resolve reports; forbidden state for non-admins.
