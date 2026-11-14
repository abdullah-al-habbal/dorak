---
nodeid: skills.repo
parentnode: repo.root
childnodes:
  - skills.repo.monorepo-task-executor
  - skills.repo.stitch-flutter-converter
  - skills.repo.codebase-cleanup
codeanchors:
  - backend/
  - frontend/web/dashboard/
  - frontend/mobile/
---

# Repository skills

AI agent skills for this area. Each skill is a directory with a `SKILL.md` entry point.

- [Monorepo Task Executor](monorepo-task-executor/SKILL.md)
- [Stitch Export → Flutter Atomic Converter](stitch-flutter-converter/SKILL.md)

## Shared hygiene skill

- [Codebase Cleanup](codebase-cleanup/SKILL.md) — what "clean up the codebase" means for every agent:
  removes only Git-ignored leftovers (logs, caches, build and test output, IDE and generated files) in the
  backend, the dashboard and the three mobile apps, keeps dependencies, `.env*` files, secrets, hooks and
  uploads, and never touches work in progress, a database, Playwright or Git history. Dry run first with
  `scripts/cleanup-codebase.sh`, then `--apply`.

## Shared testing skill

- [Test Engineering](test-engineering/SKILL.md) — risk-based test strategy for the backend, the
  dashboard and the mobile apps: authorization and cross-tenant checks, lifecycle and failure tests,
  the test-effectiveness review, a 14-step workflow and a coverage-matrix format. It is reviewable
  guidance with no script behind it, and it defers to the backend `testing` skill and the task
  executor gates. Background: [Testing strategy](../../docs/architecture/testing-strategy.md).

## Shared security skill

- [Security Audit](security-audit/SKILL.md) — Cloudflare's defensive, source-first
  vulnerability review (`cloudflare/security-audit-skill`, MIT, commit
  `c1c8a8c1471069fb0e188eeaff69b8e8db6564a8`). The task executor runs it in guidance mode on
  every task diff that crosses a trust boundary
  ([security-review.md](monorepo-task-executor/references/security-review.md)); its full audit
  mode runs only on explicit request and writes outside the repository. The files were copied
  unchanged from upstream after review rather than installed with `npx skills add`, so the skill
  has no `skills-lock.json` entry yet; running
  `npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit`
  at the root adds one.

## Shared UI/UX skills

Installed from upstream with `npx skills add` run at the repository root, so
the web dashboard and the Flutter apps use one copy. Versions are recorded in
the root `skills-lock.json`.

- [Frontend Design](frontend-design/SKILL.md) — avoids generic "AI slop" and
  commits to a deliberate visual direction (`anthropics/skills`).
- [Interface Design](interface-design/SKILL.md) — saves design decisions to
  `.interface-design/system.md` so screens stay consistent
  (`Dammyjay93/interface-design`).
- `ui-ux-pro-max` — styles, palettes, and font pairings, including Flutter. It
  is a Claude Code plugin enabled at project scope in the local
  `.claude/settings.json`, not a folder here. Enable it with
  `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill` and
  `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill`, choosing project scope.

Web-only skills (`shadcn`, `migrate-radix-to-base`, `web-design-guidelines`)
live in `frontend/web/dashboard/.claude/skills/` because they do not apply
to Flutter or the backend.
