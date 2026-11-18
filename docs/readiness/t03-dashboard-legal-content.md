---
nodeid: docs.readiness.t03
parentnode: docs.readiness
childnodes: []
codeanchors:
  - frontend/web/dashboard/src/
  - backend/modules/Marketing/Http/
---

# T3. Dashboard legal content management

Status: todo · Phase 2 · Depends on: T2 · Reuses: the website-content screen (FT-13)

- [ ] T3.1 Publish toggle and published-state column on the website-content screen.
- [ ] T3.2 Admin request and resource carry `published_at`; proxy allow-list updated.
- [ ] T3.3 EN and AR completeness hint per page.
- [ ] T3.4 Change tracking: record publish and unpublish through `Modules\Audit`.

Tests: Pest admin update (401, 403, 422, 200); Vitest for the screen.
Acceptance: an admin can edit, translate, publish and unpublish each legal page.
