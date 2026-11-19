---
nodeid: repo.claude
parentnode: repo.root
childnodes:
  - repo.claude.part-2
codeanchors:
  - backend/
  - frontend/web/dashboard/
  - frontend/mobile/
---

# Dorak Monorepo — Claude Guide

These instructions apply across the repository and mirror
[AGENTS.md](AGENTS.md). A nested `CLAUDE.md` or `AGENTS.md` adds the rules for
its subsystem and takes precedence when more specific; read it before changing
files in that area.

## Start here

- Read [README.md](README.md) for the project map and local setup.
- For planned work, read the [backlog](docs/backlog/index.md) (open decisions, bugs,
  missing features, tech debt, test gaps) and update it when an item is done or a
  decision is resolved.
- Competitor studies (market context, not requirements) are in [docs/competitor-analysis/index.md](docs/competitor-analysis/index.md); the first is [Toptalla](docs/competitor-analysis/toptalla/index.md).
- Use [the documentation index](docs/index.md) to find maintained product,
  architecture, and engineering documentation.
- Before changing a subsystem, read its guide:
  - Backend: [backend/AGENTS.md](backend/AGENTS.md) and
    [backend/CLAUDE.md](backend/CLAUDE.md).
  - Dashboard: [frontend/web/dashboard/AGENTS.md](frontend/web/dashboard/AGENTS.md)
    and [frontend/web/dashboard/CLAUDE.md](frontend/web/dashboard/CLAUDE.md).
  - Mobile: [frontend/mobile/AGENTS.md](frontend/mobile/AGENTS.md),
    [frontend/mobile/CLAUDE.md](frontend/mobile/CLAUDE.md), and the guides in
    the app or package being changed.

## Backlog

- Everything still open lives in [docs/backlog/index.md](docs/backlog/index.md). Batch 2 and WP-10 (billing, NS-27) stay out of scope until the owner says so.

## Repository-wide rules

- **No relative module imports.** Use PHP namespaces, TypeScript `@/` aliases,
  or Dart `package:` imports. Never use `./` or `../` in an import.
- **Imports stay at the top of the file.** Do not add inline imports or
  fully-qualified class names inline; add a top-level import and use its name.
- Keep backend PHP files on `declare(strict_types=1);` and follow the local
  framework patterns documented in `backend/AGENTS.md`.
- Preserve subsystem boundaries and do not move application code into shared
  mobile packages. Existing API contracts are kept stable for the mobile apps.
  **Backend contract policy:** when the dashboard needs a field, filter,
  resource or endpoint the backend lacks, change the backend (model, resource,
  request, action) with Pest coverage and docs instead of building a frontend
  workaround. Keep the change backward compatible or sync the mobile apps in
  the same task.
- Add focused regression coverage for changed behavior and run the checks
  required by the subsystem guide. Mark work complete only after its
  acceptance criteria and required gates pass.
- Each subsystem guide carries its own security and code-quality governance
  (authorization/ownership checks, type-safety rules, file/method size limits,
  magic-literal and data-clump avoidance, UI performance rules) — read
  `backend/CLAUDE.md`, `frontend/web/dashboard/AGENTS.md`, or
  `frontend/mobile/CLAUDE.md` before writing code in that area; these rules
  apply in addition to, not instead of, the subsystem's existing skills.

## Testing

- For writing, reviewing or expanding tests, regression tests, and security-sensitive changes, use
  [test-engineering](.claude/skills/test-engineering/SKILL.md) (strategy: [testing strategy](docs/architecture/testing-strategy.md)).

## UI/UX skills

- For any dashboard or mobile UI work, use the shared skills in
  [.claude/skills](.claude/skills/README.md): `frontend-design` for visual
  direction, `interface-design` to record and reuse decisions in
  `.interface-design/system.md`, and the `ui-ux-pro-max` plugin for palettes
  and type. Do not duplicate them into subprojects.
- Dashboard work also uses the local `shadcn`, `migrate-radix-to-base`, and
  `web-design-guidelines` skills in `frontend/web/dashboard/.claude/skills/`;
  run `web-design-guidelines` before shipping UI changes.

## Monorepo Hygiene & Automated Cleanup Policy (Mandatory for AI Agents)

To prevent repository bloat, high disk usage, and stale build artifacts, every AI
agent working in the Dorak monorepo MUST run these cleanup cycles during
initialization or verification. They only remove regenerable, git-ignored output.

1. Frontend dashboard cache and reports:
   `cd frontend/web/dashboard && npm run clean:artifacts`
   (Stop a running `next dev` first, or restart it afterwards; it rebuilds `.next/`.)
2. Backend temporary logs:
   `cd backend && rm -f storage/logs/*.log`
   (Keep the logs while you are investigating a failure that they record.)
3. Flutter / mobile build artifacts via Melos:
   `cd frontend/mobile && dart run melos run clean`

Never delete tracked files or `.gitignore` placeholders as part of this cycle.

When the owner asks to "clean up the codebase" (a full cleanup of every ignored leftover, not only this
cycle), follow the [codebase-cleanup](.claude/skills/codebase-cleanup/SKILL.md) skill: dry run first, then
`--apply`.

## Git workflow (local only)

- Preserve unrelated working-tree changes and stage only the files a task
  touches. Never use destructive Git commands or `--no-verify`.
- Commit locally with a conventional commit type and the task number, for
  example `fix(catalog): ... (Task 14)`.
- Never run `git push`, add or change remotes, or alter remote tracking unless
  the user explicitly requests it.

## Continued in

- [Part 2: Task execution](docs/repo-guides/claude-part-2.md)
