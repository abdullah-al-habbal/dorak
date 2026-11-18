---
nodeid: docs.readiness.t07
parentnode: docs.readiness
childnodes: []
codeanchors:
  - backend/modules/Branch/
---

# T7. Branch account deletion (conditional)

Status: skipped · Phase 4 · Depends on: owner decision

Default assumption: branch accounts are created by an owner or admin, so removal goes through the dashboard and no
in-app deletion is required. Revisit if `business_app` users can self-register.

- [ ] T7.1 Owner decision: can `business_app` users create their own accounts?
- [ ] T7.2 If yes: mirror T6 for branch accounts and add the screen to `business_app`.
