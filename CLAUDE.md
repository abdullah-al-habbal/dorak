---
nodeid: repo.claude
parentnode: repo.root
childnodes:
  - repo.claude.part-2
codeanchors:
  - backend/
  - frontend/dashboard/
  - frontend/mobile/
---

# Dorak Monorepo — Claude Guide

These instructions apply across the repository and mirror
[AGENTS.md](AGENTS.md). A nested `CLAUDE.md` or `AGENTS.md` adds the rules for
its subsystem and takes precedence when more specific; read it before changing
files in that area.

## Start here

- Read [README.md](README.md) for the project map and local setup.
- For planned work, read [open decisions](docs/decisions-required.md) and
  update the relevant decision record when a decision is resolved.
- Use [the documentation index](docs/index.md) to find maintained product,
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
  required by the subsystem guide. Mark work complete only after its
  acceptance criteria and required gates pass.
- Each subsystem guide carries its own security and code-quality governance
  (authorization/ownership checks, type-safety rules, file/method size limits,
  magic-literal and data-clump avoidance, UI performance rules) — read
  `backend/CLAUDE.md`, `frontend/dashboard/AGENTS.md`, or
  `frontend/mobile/CLAUDE.md` before writing code in that area; these rules
  apply in addition to, not instead of, the subsystem's existing skills.

## Git workflow (local only)

- Preserve unrelated working-tree changes and stage only the files a task
  touches. Never use destructive Git commands or `--no-verify`.
- Commit locally with a conventional commit type and the task number, for
  example `fix(catalog): ... (Task 14)`.
- Never run `git push`, add or change remotes, or alter remote tracking unless
  the user explicitly requests it.

## Continued in

- [Part 2: Task execution](docs/claude-part-2.md)
