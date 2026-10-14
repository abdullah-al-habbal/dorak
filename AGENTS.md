# Dorak Monorepo Agent Guide

These instructions apply across the repository. A nested `AGENTS.md` or
`CLAUDE.md` adds the rules for its subsystem and takes precedence when more
specific; read it before changing files in that area.

## Start here

- Read [README.md](README.md) for the project map and local setup.
- For planned work, read [the work tracker](docs/todowork.md), the complete
  linked specification under `docs/tasks/`, and
  [open decisions](docs/decisions-required.md). Update the relevant decision
  record and task specification when a decision is resolved.
- Use [the documentation index](docs/INDEX.md) to find maintained product,
  architecture, and engineering documentation.
- Before changing a subsystem, read its guide:
  - Backend: [backend/AGENTS.md](backend/AGENTS.md) and
    [backend/CLAUDE.md](backend/CLAUDE.md).
  - Dashboard: [frontend/dashboard/AGENTS.md](frontend/dashboard/AGENTS.md)
    and [frontend/dashboard/CLAUDE.md](frontend/dashboard/CLAUDE.md).
  - Mobile: [frontend/mobile/AGENTS.md](frontend/mobile/AGENTS.md),
    [frontend/mobile/CLAUDE.md](frontend/mobile/CLAUDE.md), and the guides in
    the app or package being changed.

## Repository-wide rules

- **No relative module imports.** Use PHP namespaces, TypeScript `@/` aliases,
  or Dart `package:` imports. Never use `./` or `../` in an import.
- **Imports stay at the top of the file.** Do not add inline imports or
  fully-qualified class names inline; add a top-level import and use its name.
- Keep backend PHP files on `declare(strict_types=1);` and follow the local
  framework patterns documented in `backend/AGENTS.md`.
- Preserve subsystem boundaries and existing API contracts. Do not invent
  endpoints or move application code into shared mobile packages.
- Add focused regression coverage for changed behavior and run the checks
  required by the subsystem guide and task specification. Mark a task complete
  only after its acceptance criteria and required gates pass.
- Preserve unrelated working-tree changes. Never use destructive Git commands.
  Do not push or change remotes unless the user explicitly requests it.
- Prefer the reusable [Dorak task executor](.agents/skills/monorepo-task-executor/SKILL.md)
  for document-routed task work.
- When the user types `/graphify`, invoke the available Skill tool with
  `skill: "graphify"` before doing anything else.

## Main areas

- `backend/` — Laravel modular monolith and API.
- `frontend/dashboard/` — Next.js operations dashboard and backend-for-frontend.
- `frontend/mobile/` — Flutter apps and shared Dart workspace packages.
- `docs/` — cross-project task specifications, decisions, and architecture docs.
