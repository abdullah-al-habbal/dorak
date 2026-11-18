---
nodeid: docs.readiness.t13
parentnode: docs.readiness
childnodes: []
codeanchors:
  - docs/
---

# T13. Docs and full gates

Status: todo · Phase 7 · Depends on: all other tasks

- [ ] T13.1 Update `docs/index.md` (link this folder), `docs/backlog/index.md`, `backend/docs/feature-index.md` and the mobile feature indexes.
- [ ] T13.2 Backend: Pest, Pint, `composer audit`.
- [ ] T13.3 Dashboard: lint, typecheck, Vitest, build, Playwright.
- [ ] T13.4 Mobile: `melos verify`.
- [ ] T13.5 `scripts/check-conventions.sh`.
- [ ] T13.6 Repo hygiene cleanup cycle from `AGENTS.md`.

Acceptance: all gates pass on a clean tree; every task above is `done` or `skipped` with a reason.
