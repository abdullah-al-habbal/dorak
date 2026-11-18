---
nodeid: docs.readiness.t08
parentnode: docs.readiness
childnodes: []
codeanchors:
  - frontend/mobile/packages/
---

# T8. Shared mobile layer

Status: todo · Phase 5 · Depends on: T2, T4

- [ ] T8.1 Endpoints and a feedback repository in `packages/core`.
- [ ] T8.2 Reusable About/Legal and feedback widgets in `packages/design_system`.
- [ ] T8.3 EN and AR ARB keys in `packages/localization`, added together.
- [ ] T8.4 Approved by the owner (2026-11-18). Add `url_launcher` and `package_info_plus` (opens legal links and the web owner registration; sends `app_version`). Record both in `packages/core/CLAUDE.md` section 2 (third-party set).

Tests: repository and bloc-level tests; `melos verify`.
Acceptance: the shared pieces are usable by all three apps without app-specific code in packages.
