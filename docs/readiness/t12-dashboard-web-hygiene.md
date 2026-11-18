---
nodeid: docs.readiness.t12
parentnode: docs.readiness
childnodes: []
codeanchors:
  - frontend/web/dashboard/
---

# T12. Dashboard web hygiene

Status: todo · Phase 6 · Depends on: none

- [ ] T12.1 Add `robots: { index: false, follow: false }` to the root layout metadata so login and register are not indexed.
- [ ] T12.2 Add a Firefox project to `playwright.config.ts` for the smoke specs and run it.
- [ ] T12.3 Record any Firefox-specific failures as backlog items instead of claiming compatibility.

Acceptance: private pages carry noindex; Firefox smoke results are documented.
