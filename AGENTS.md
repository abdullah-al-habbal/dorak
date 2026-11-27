---
nodeid: repo.agents
parentnode: repo.root
childnodes: []
codeanchors:
  - backend/
  - frontend/web/dashboard/
  - frontend/mobile/
---

# Dorak Monorepo Agent Guide

These instructions apply across the repository. This is the one shared guide;
[CLAUDE.md](CLAUDE.md) imports it. A nested `AGENTS.md` or `CLAUDE.md` adds the
rules for its subsystem and takes precedence when more specific; read it before
changing files in that area.

## Start here

- Read [README.md](README.md) for the project map and local setup.
- For the current fix programme, start at the [wave tracker](docs/waves/index.md): read it and only the active wave file, and update both as you work.
- For planned work, read the [backlog](docs/backlog/index.md) (open decisions, bugs,
  missing features, tech debt, test gaps) and update it when an item is done or a
  decision is resolved. Batch 2 and billing (NS-26, NS-27, WP-10) stay out of
  scope until the owner says so.
- Competitor studies (market context, not requirements) are in [docs/competitor-analysis/index.md](docs/competitor-analysis/index.md); the first is [Toptalla](docs/competitor-analysis/toptalla/index.md).
- Current state of live work (what is deployed on dev, URLs, configuration names, open owner decisions): [dev environment status](docs/deployment/dev-environment-status.md) and [push notifications](docs/architecture/push-notifications.md). Parallel sessions coordinate on the [session board](docs/sessions/index.md).
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
- Each subsystem guide carries its own security and code-quality rules
  (authorization and ownership checks, type safety, file and method size limits,
  magic literals and data clumps, UI performance). Read `backend/AGENTS.md` and
  `backend/CLAUDE.md`, `frontend/web/dashboard/AGENTS.md`, or
  `frontend/mobile/CLAUDE.md` before writing code there. They apply in addition
  to the subsystem's skills.
- Prefer the reusable [Dorak task executor](.claude/skills/monorepo-task-executor/SKILL.md)
  for engineering task work: audit the request, implement the vertical slice, run
  the applicable gates, and call the work done only on evidence.
- When the user types `/graphify`, invoke the available Skill tool with
  `skill: "graphify"` before doing anything else.

## Git workflow

- Preserve unrelated working-tree changes and stage only the files a task
  touches. Never use destructive Git commands or `--no-verify`.
- Commit locally with a conventional commit type and the task number, for
  example `fix(catalog): ... (Task 14)`.
- Push only when the owner asks, or at a wave close under the Delivery decision
  in the [backlog](docs/backlog/index.md). Never add or change remotes or alter
  remote tracking unless the owner asks.

## Documentation

- The code decides what the system does; owner decisions and product rules decide
  what it should do. When they disagree, report it; don't rewrite the rule.
- One topic per file and one home per fact. Update the owning file before
  creating a new one. Delete obsolete files; Git keeps the history.
- Keep status out of reference documents: open work belongs in the backlog, and
  the deployed state in [dev environment status](docs/deployment/dev-environment-status.md).

## Testing

- For writing, reviewing or expanding tests, regression tests, and security-sensitive changes, use
  [test-engineering](.claude/skills/test-engineering/SKILL.md) (strategy: [testing strategy](docs/architecture/testing-strategy.md)).

## UI/UX skills

- For any dashboard or mobile UI work, use the shared skills in
  [.claude/skills](.claude/skills/README.md): `frontend-design` for visual
  direction, `interface-design` to record and reuse decisions in
  `.interface-design/system.md` (the dashboard's is in `frontend/web/dashboard/`), and the `ui-ux-pro-max` plugin for palettes
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

## Main areas

- `backend/` — Laravel modular monolith and API.
- `frontend/web/dashboard/` — Next.js operations dashboard and backend-for-frontend (the only dashboard).
- `frontend/mobile/` — Flutter apps and shared Dart workspace packages.
- `docs/` — cross-project decisions and architecture docs.
