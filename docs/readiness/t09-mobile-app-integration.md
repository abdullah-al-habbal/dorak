---
nodeid: docs.readiness.t09
parentnode: docs.readiness
childnodes: []
codeanchors:
  - frontend/mobile/apps/
---

# T9. App integration

Status: done · Phase 5 · Depends on: T6, T8

- [x] T9.1 `client_app`: legal links and feedback form in the profile screen; the delete flow already exists.
- [x] T9.2 `stylist_app`: legal links, feedback form, and a delete-account screen modelled on the client bloc (needs T6).
- [x] T9.3 `business_app`: legal links and feedback form.
- [x] T9.4 Each submission sends app, platform, version, locale and screen.

Tests: bloc tests for submit and error states; widget test for the stylist delete flow; `melos verify`.
Acceptance: every app reaches privacy, terms, support and feedback; stylist can delete the account.

## Implementation notes

- `core` gains a pure-Dart `FeedbackBloc` (`FeedbackSubmitted` / `FeedbackReset`; states idle, sending, sent, failed with `FeedbackFailure` rateLimited, invalid, network, unknown). It adds app, platform and version itself; the screen passes the locale and a lowercase `screen` key (`profile/about`, `more/about`). Test: `packages/core/test/feedback_bloc_test.dart`.
- Each app has `features/support/about_support.screen.dart` (legal links, version, feedback entry) and `feedback.screen.dart`. Entry points: client Profile > About and legal, stylist and business More > About and legal.
- `stylist_app` also has the delete-account bloc, screen and error mapping (`ACCOUNT_HAS_ACTIVE_BOOKINGS`, `ACCOUNT_HAS_ACTIVE_AFFILIATION`, 401 or 422 wrong password). On success it runs the unauthorized path (clears the token and returns to login). New ARB key `deleteAccountActiveAffiliation`.
- Routers take an optional `legalLinks` so tests do not need dotenv. Tests: `stylist_support_flow_test.dart`, `business_support_flow_test.dart`, `client_support_flow_test.dart`; `melos verify` passes.
