---
nodeid: docs.readiness.t05
parentnode: docs.readiness
childnodes: []
codeanchors:
  - frontend/web/dashboard/src/
---

# T5. Dashboard support inbox

Status: done · Phase 3 · Depends on: T4 · Reuses: the shared list-screen pattern and `tests/helpers/list-screen.helper.tsx`

- [x] T5.1 List screen with filters by kind, app, platform and status.
- [x] T5.2 Detail dialog: source context shown separately from the related entity; status and note editing.
- [x] T5.3 Proxy allow-list entry, route, navigation item, EN and AR strings.

Tests: Vitest list states and dialog; one Playwright smoke spec.
Acceptance: an admin can filter, read and resolve reports; forbidden state for non-admins.

## Implementation notes

- Route `/dashboard/admin/support` (nav key `support`, admin only), `FeedbackScreen`, `FeedbackToolbar` (kind, status, app, platform, search; URL-backed), `FeedbackList`, `FeedbackDetailDialog` (overlay kind `feedback-detail`).
- The sender's text is only ever rendered as a React text node (`dir="auto"`, `whitespace-pre-wrap`); a Vitest case checks that markup stays plain text.
- Tests use the committed list-screen helper (`describeListStates`), so they pass without the uncommitted helper rewrite in the working tree. Vitest: screen states, dialog (escaping, save, failure), filter util. Full dashboard run: 1070 passed.
- Deferred to T13: the Playwright smoke spec (runs against a production build and wipes `dorak_test`), the dashboard build and the `web-design-guidelines` review.
