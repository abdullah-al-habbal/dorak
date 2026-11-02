---
nodeid: repo.claude.part-2
parentnode: repo.claude
childnodes: []
codeanchors:
  - backend/
  - frontend/dashboard/
  - frontend/mobile/
---

Part 2 of 2 · [Dorak Monorepo — Claude Guide](../../CLAUDE.md) · [Previous](../../CLAUDE.md)

## Task execution

- Prefer the reusable
  [Dorak task executor](../../.claude/skills/monorepo-task-executor/SKILL.md) for
  engineering task work: audit the request, implement the vertical slice, run
  the applicable gates, and call the work done only on
  evidence.
- When the user types `/graphify`, invoke the Skill tool with
  `skill: "graphify"` before doing anything else.

## Main areas

- `backend/` — Laravel modular monolith and API.
- `frontend/dashboard/` — Next.js operations dashboard and backend-for-frontend.
- `frontend/mobile/` — Flutter apps and shared Dart workspace packages.
- `docs/` — cross-project decisions and architecture docs.
