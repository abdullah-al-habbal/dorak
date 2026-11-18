---
nodeid: docs.readiness.t07
parentnode: docs.readiness
childnodes: []
codeanchors:
  - backend/modules/Branch/
---

# T7. Branch account deletion (conditional)

Status: skipped (confirmed by the owner, 2026-11-18) · Phase 4

Default assumption: branch accounts are created by an owner or admin, so removal goes through the dashboard and no
in-app deletion is required. Revisit if `business_app` users can self-register.

- [x] T7.1 Decision: branch accounts are created by an owner or admin, so no self-registration or in-app deletion.
- [-] T7.2 (not needed) If yes: mirror T6 for branch accounts and add the screen to `business_app`.
