---
nodeid: skills.repo
parentnode: repo.root
childnodes:
  - skills.repo.monorepo-task-executor
  - skills.repo.stitch-flutter-converter
codeanchors:
  - backend/
  - frontend/dashboard/
  - frontend/mobile/
---

# Repository skills

AI agent skills for this area. Each skill is a directory with a `SKILL.md` entry point.

- [Monorepo Task Executor](monorepo-task-executor/SKILL.md)
- [Stitch Export → Flutter Atomic Converter](stitch-flutter-converter/SKILL.md)

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
live in `frontend/web/new-dashboard/.claude/skills/` because they do not apply
to Flutter or the backend.
