---
nodeid: docs.readiness.t16
parentnode: docs.readiness
childnodes: []
codeanchors:
  - frontend/mobile/apps/business_app/
---

# T16. `business_app` brand owner experience

Status: todo · Phase 6 · Depends on: T9, T14, T15 · Follow `business_app/CLAUDE.md` and the Dart file taxonomy

- [ ] T16.1 Audit the current `business_app` router, auth bloc and shell; decide the smallest split between the branch shell and the owner shell.
- [ ] T16.2 Login: one screen with a "Branch account" / "Brand owner" choice. Branch uses `/branch/login`; owner uses client login plus `GET owner/me`. Forgot and reset password per role. Logout clears the right session.
- [ ] T16.3 "Register as a brand owner" link opens the web `/register/business` (url_launcher from T8). No in-app sign-up.
- [ ] T16.4 Owner shell: brand overview with the status banner (pending approval with the D11 limits, rejected with the reason and resubmit, suspended read-only).
- [ ] T16.5 Branches: list, detail, create, edit, switch on and off, respecting the same limits.
- [ ] T16.6 Read-only subscription and payouts; services management for the owner (decision C).
- [ ] T16.7 EN and AR strings together, RTL checked, accessibility labels, and the shared design system widgets (no raw spacing or colors).
- [ ] T16.8 Docs: `business_app` feature index and `AGENTS.md`.

Tests: bloc tests for login role routing, the owner home states and the branch actions; widget tests for the pending and suspended banners; `melos verify`.
Acceptance: an approved owner can sign in on the phone and manage their brand and branches; a pending owner sees only what D11 allows; branch accounts keep working unchanged.
