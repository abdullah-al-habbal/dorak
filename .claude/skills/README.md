---
nodeid: skills.repo
parentnode: repo.root
childnodes:
  - skills.repo.monorepo-task-executor
  - skills.repo.stitch-flutter-converter
codeanchors:
  - backend/
  - frontend/web/dashboard/
  - frontend/mobile/
---

# Repository skills

AI agent skills for this area. Each skill is a directory with a `SKILL.md` entry point.

- [Monorepo Task Executor](monorepo-task-executor/SKILL.md)
- [Stitch Export → Flutter Atomic Converter](stitch-flutter-converter/SKILL.md)

## Shared planning skill

- [LLM Council](llm-council/SKILL.md) — a feasibility gate for medium and complex tasks: five
  read-only advisors, anonymous peer review and a chairman issue PROCEED or HALT; one upheld,
  evidence-backed rejection halts the task. The task executor runs it as Step 3a. It is a Dorak
  implementation of Karpathy's LLM Council method and the five advisors of
  `aiwithremy/claude-skills-llm-council`, whose repository has no licence and so is not copied.

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
