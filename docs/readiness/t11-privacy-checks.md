---
nodeid: docs.readiness.t11
parentnode: docs.readiness
childnodes: []
codeanchors:
  - backend/modules/
---

# T11. Privacy and security checks

Status: todo · Phase 6 · Depends on: none · Output: a fix or a written finding for each item

- [ ] T11.1 Confirm `ClientAccountDeletion` also purges face photos and face-profile data; add a test if it does not.
- [ ] T11.2 Review the payment-gateway admin CRUD for credential storage; keep secrets out of ordinary admin forms.
- [ ] T11.3 Check OTP, password-reset and registration endpoints for user enumeration.
- [ ] T11.4 Add a production env checklist to the deployment docs (`APP_DEBUG=false`, no `log` SMS or mail driver, secure cookies).
- [ ] T11.5 Check uploads for type, size and storage path rules on the face, portfolio and onboarding-hero endpoints.

Acceptance: each item is fixed with a test, or recorded as a finding with a decision.
