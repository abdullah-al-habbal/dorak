---
nodeid: docs.readiness.t16
parentnode: docs.readiness
childnodes: []
codeanchors:
  - frontend/mobile/apps/business_app/
---

# T16. `business_app` brand owner experience

Status: done · Phase 6 · Depends on: T9, T14, T15 · Follow `business_app/CLAUDE.md` and the Dart file taxonomy

- [x] T16.1 Audit the current `business_app` router, auth bloc and shell; decide the smallest split between the branch shell and the owner shell.
- [x] T16.2 Login: one screen with a "Branch account" / "Brand owner" choice. Branch uses `/branch/login`; owner uses client login plus `GET owner/me`. Forgot and reset password per role. Logout clears the right session.
- [x] T16.3 "Register as a brand owner" link opens the web `/register/business` (url_launcher from T8). No in-app sign-up.
- [x] T16.4 Owner shell: brand overview with the status banner (pending approval with the D11 limits, rejected with the reason and resubmit, suspended read-only).
- [x] T16.5 Branches: list, detail, create, edit, switch on and off, respecting the same limits.
- [x] T16.6 Read-only subscription and payouts; services management for the owner (decision C).
- [x] T16.7 EN and AR strings together, RTL checked, accessibility labels, and the shared design system widgets (no raw spacing or colors).
- [x] T16.8 Docs: `business_app` feature index and `AGENTS.md`.

Tests: bloc tests for login role routing, the owner home states and the branch actions; widget tests for the pending and suspended banners; `melos verify`.
Acceptance: an approved owner can sign in on the phone and manage their brand and branches; a pending owner sees only what D11 allows; branch accounts keep working unchanged.

## Implementation notes

- Smallest split: one router, one session bloc. `RoleAuthRepository` is the single `StaffAuthRepository` the session and password-reset blocs use; it forwards to the branch or the owner API and stores the role after a successful login. The role is kept in shared_preferences (new dependency of `business_app`, already used by `core`) so the app opens in the right shell offline.
- Owner sign-in is the client login; whether the client owns a brand is decided on the owner home through `GET owner/me` (no brand shows the web registration link and a logout).
- Services form takes the English and Arabic names; editing prefills both with the single name the API returns.
- Tests: `owner_cubits_test.dart` (role routing, home states, branch actions), `owner_flow_test.dart` (pending, rejected with resubmit, suspended, no brand, RTL, branch switch, branch form, role guard, login role choice). `melos verify` passes.
