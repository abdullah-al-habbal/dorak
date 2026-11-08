---
name: monorepo-task-executor
description: Executes and closes engineering tasks in the Dorak Operations monorepo with a deep audit, 100% full-stack sync (backend, API contract, docs, dashboard, all mobile apps, tests), quality gates, and a local-only commit. Use when asked to run, implement, process, complete, or close a Dorak task such as "implement X" or "close Y".
nodeid: skills.repo.monorepo-task-executor
parentnode: skills.repo
childnodes:
  - skills.repo.monorepo-task-executor.references.audit-directive
  - skills.repo.monorepo-task-executor.references.dashboard-shared-primitives
  - skills.repo.monorepo-task-executor.references.fullstack-sync
  - skills.repo.monorepo-task-executor.references.gates
  - skills.repo.monorepo-task-executor.references.gotchas
  - skills.repo.monorepo-task-executor.templates.commit-message
  - skills.repo.monorepo-task-executor.templates.decision-record
  - skills.repo.monorepo-task-executor.templates.final-report
  - skills.repo.monorepo-task-executor.templates.implemented-contract
codeanchors:
  - backend/
  - frontend/web/dashboard/
  - frontend/mobile/
---

# Monorepo Task Executor

## Invocation

> Implement the slot-availability change using monorepo-task-executor.

Nothing else is required. The audit directive, full-stack sync, gates, and local commit below are the default behaviour and need not be restated. The requirement is the user's request plus `docs/decisions-required.md`.

## Folder map (load on demand, not up front)

| Path | Use it when |
| --- | --- |
| `scripts/preflight.sh [topic]` | Step 1: workspace state, open decisions, guides to read |
| `scripts/check-conventions.sh` | Step 6 and before staging: relative imports, inline FQCNs, `strict_types`, `git diff --check` |
| `references/audit-directive.md` | Step 2: sources to read, no-guessing rule, evidence-graded findings, finding every path to a behaviour |
| `references/fullstack-sync.md` | Steps 3 and 5: the layer matrix and contract ripple rules |
| `references/gates.md` | Step 7: exact commands per subsystem and baseline handling |
| `references/gotchas.md` | Step 5: pitfalls learned from earlier tasks |
| `references/dashboard-shared-primitives.md` | Steps 3 and 5, and every dashboard review: the shared hooks, key factory, field builders and mappers that must be reused, not re-implemented |
| `templates/decision-record.md` | Step 4: wording for `decisions-required.md` |
| `templates/implemented-contract.md` | Step 4: the section recorded in the change report or relevant doc |
| `templates/commit-message.md`, `templates/final-report.md` | Steps 9 and 10 |

## Workflow

1. **Establish the workspace.** Run `scripts/preflight.sh [topic]`. Preserve unrelated edits and never stage them. Never push, change remotes, or use `--no-verify`.
2. **Audit.** Read every file `preflight` lists and the request in full, following `references/audit-directive.md`. If the request, a guide, or the code disagree, or a decision is open and unprescribed, stop and report it; do not guess.
3. **Define the vertical slice.** Apply `references/fullstack-sync.md`: list affected layers, every entry point to the behaviour, and explicit out-of-scope items. Verify any client behaviour the request names even if no change is expected. For dashboard work, map each piece of the slice to a primitive in `references/dashboard-shared-primitives.md` before planning new code.
4. **Record decisions and the contract.** Use `templates/decision-record.md` in `docs/decisions-required.md`; add the implemented contract to the relevant doc with `templates/implemented-contract.md`.
5. **Implement with local conventions.** Imports at the top, no relative module imports, `declare(strict_types=1)`, local framework patterns per the subsystem guides. Apply each subsystem's security and quality governance (`backend/CLAUDE.md`, `frontend/web/dashboard/AGENTS.md`, `frontend/mobile/CLAUDE.md`): authorization/ownership checks, no `any`/`dynamic` escapes, file/method size limits, no magic literals or parameter clumps. Add regression tests for allowed, rejected, and side-effect behaviour. For UI work in the dashboard or mobile apps, use the shared `frontend-design` and `interface-design` skills (see `.claude/skills/README.md`); dashboard UI also runs `web-design-guidelines` before closing. If the dashboard needs a contract the backend lacks, change the backend (backward compatible for mobile) instead of adding a frontend workaround. Read `references/gotchas.md` first. In the dashboard, reuse or extend the primitives in `references/dashboard-shared-primitives.md`; this applies to fixes, hotfixes and reviews as much as to features. When a task adds a new primitive, add its row there in the same commit.
6. **Iterate narrowly.** Focused tests and formatters on touched files only; run `scripts/check-conventions.sh`.
7. **Run gates** from `references/gates.md` for every touched subsystem, in this order: backend Pest and Pint, dashboard lint, typecheck, Vitest and build, **Playwright E2E**, mobile `melos verify`, then `scripts/check-conventions.sh`. A contract change means backend, dashboard, and mobile gates all run. Playwright is mandatory for dashboard work and must fully pass; ask before running it if the user has not authorised wiping the dev database.
8. **Close on evidence.** Verify each acceptance criterion. Call the work done only after all applicable gates pass, Playwright included. If any gate fails or is blocked by the environment, do not commit: leave the task incomplete and report the failure or blocker.
8a. **Hygiene cleanup** (only after every gate passed, so failure artifacts stay available while debugging): `cd frontend/web/dashboard && npm run clean:artifacts`; `cd backend && rm -rf storage/framework/cache/phpstan/ && rm -f storage/logs/*.log`; `cd frontend/mobile && dart run melos run clean`. These remove only git-ignored output; never delete tracked files or placeholders. Stop `next dev` first or restart it. Then run `cd frontend/web/dashboard && npx next typegen`, because the cleanup removes the generated route types the pre-commit typecheck needs.
9. **Review and commit locally, only if every gate including Playwright passed.** `git diff --check`, inspect `git diff` and `git status`, revert unrelated formatter output, stage task files only, inspect `git diff --cached`, commit with `templates/commit-message.md` (conventional type, task number, session attribution). Let pre-commit hooks finish. Run `git status --short` afterwards.
10. **Report** using `templates/final-report.md`: SHA, decisions and inconsistencies, per-layer changes (including layers deliberately unchanged), gate table, pre-existing findings, anything left undone.

## Guardrails

- The request and resolved decisions are the source of truth; do not silently expand or shrink scope.
- Preserve existing user changes; avoid destructive Git or file operations; never touch remotes.
- Dashboard code never re-implements a primitive listed in `references/dashboard-shared-primitives.md`, whatever the task type (feature, fix, hotfix, review).
- Follow nested project instructions even when their commands differ from these defaults.
- Never claim a gate passed unless its command completed and you saw the result.
- Never commit when Playwright E2E, or any other gate, fails or was not run.
- Keep this file under 500 lines and each reference under 200; put new detail in `references/` or `templates/`.

## Mandatory Engineering Gotchas & Rules (Codified from Batch 2 Refactor Learnings)

These apply to every task type (feature, fix, hotfix, refactor, review) and add to the workflow above; exact commands are in `references/gates.md`.

1. **Playwright runs against a production build, never `next dev`.** The dev server fetches Google Fonts at runtime, and that lookup fails in sandboxed or offline runs. `playwright.config.ts` starts `npm run build && npm start` with an extended (600 s) timeout, but it reuses any server already on port 3000, so stop a running `next dev` before Playwright starts. Do not shorten that timeout or point E2E at a dev server.
2. **Run Playwright with `TZ=UTC`.** The backend clock is UTC (`modules/Core/Config/app.php`) and the seeder builds "today" from `now()`, while the Next server and browser inherit the machine's local zone. Without `TZ=UTC`, runs between 00:00 and 03:00 local time (+03:00) see a different "today" than the seed and fail date-based specs. Every Playwright command, focused or full, is prefixed with `TZ=UTC`.
3. **One slice per task, verified before the next starts.** Work strictly slice by slice: scan, then a minimal plan, then implement, then all gates (Playwright included), then hygiene cleanup, then one local commit for that slice. Never bundle several refactor steps, or a refactor and an unrelated fix, into one commit. A pre-existing failure found on the way is reported, and only fixed as its own task and commit once the user agrees.
