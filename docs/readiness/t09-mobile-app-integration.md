---
nodeid: docs.readiness.t09
parentnode: docs.readiness
childnodes: []
codeanchors:
  - frontend/mobile/apps/
---

# T9. App integration

Status: todo · Phase 5 · Depends on: T6, T8

- [ ] T9.1 `client_app`: legal links and feedback form in the profile screen; the delete flow already exists.
- [ ] T9.2 `stylist_app`: legal links, feedback form, and a delete-account screen modelled on the client bloc (needs T6).
- [ ] T9.3 `business_app`: legal links and feedback form.
- [ ] T9.4 Each submission sends app, platform, version, locale and screen.

Tests: bloc tests for submit and error states; widget test for the stylist delete flow; `melos verify`.
Acceptance: every app reaches privacy, terms, support and feedback; stylist can delete the account.
