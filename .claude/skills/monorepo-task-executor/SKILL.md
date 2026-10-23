---
name: monorepo-task-executor
description: Executes and closes document-routed engineering tasks in the Dorak Operations monorepo with a deep audit, 100% full-stack sync (backend, API contract, docs, dashboard, all mobile apps, tests), quality gates, and a local-only commit. Use when asked to run, implement, process, complete, or close a Dorak task such as "Task 27", "next task", or a specification under docs/tasks/. The skill name plus a task ID is a sufficient request.
---

# Monorepo Task Executor

## Invocation

> Run Task 27 using monorepo-task-executor.

Nothing else is required. The audit directive, full-stack sync, gates, and local commit below are the default behaviour and need not be restated. The spec is `docs/tasks/task-NN-*.md`.

## Folder map (load on demand, not up front)

| Path | Use it when |
| --- | --- |
| `scripts/preflight.sh <n>` | Step 1: workspace state, spec path, tracker line, task decisions, guides to read |
| `scripts/check-conventions.sh` | Step 6 and before staging: relative imports, inline FQCNs, `strict_types`, `git diff --check` |
| `references/audit-directive.md` | Step 2: sources to read, no-guessing rule, evidence-graded findings, finding every path to a behaviour |
| `references/fullstack-sync.md` | Steps 3 and 5: the layer matrix and contract ripple rules |
| `references/gates.md` | Step 7: exact commands per subsystem and baseline handling |
| `references/gotchas.md` | Step 5: pitfalls learned from earlier tasks |
| `templates/decision-record.md` | Step 4: wording for `decisions-required.md` and the spec |
| `templates/implemented-contract.md` | Step 4: the section appended to the task spec |
| `templates/commit-message.md`, `templates/final-report.md` | Steps 9 and 10 |

## Workflow

1. **Establish the workspace.** Run `scripts/preflight.sh <n>`. Preserve unrelated edits and never stage them. Never push, change remotes, or use `--no-verify`.
2. **Audit.** Read every file `preflight` lists and the spec in full, following `references/audit-directive.md`. If the spec, a guide, or the code disagree, or a decision is open and unprescribed, stop and report it; do not guess.
3. **Define the vertical slice.** Apply `references/fullstack-sync.md`: list affected layers, every entry point to the behaviour, and explicit out-of-scope items. Verify any client behaviour the spec names even if no change is expected.
4. **Record decisions and the contract.** Use `templates/decision-record.md` in both `docs/decisions-required.md` and the spec; add the implemented contract to the spec with `templates/implemented-contract.md`.
5. **Implement with local conventions.** Imports at the top, no relative module imports, `declare(strict_types=1)`, local framework patterns per the subsystem guides. Apply each subsystem's security and quality governance (`backend/CLAUDE.md`, `frontend/dashboard/AGENTS.md`, `frontend/mobile/CLAUDE.md`): authorization/ownership checks, no `any`/`dynamic` escapes, file/method size limits, no magic literals or parameter clumps. Add regression tests for allowed, rejected, and side-effect behaviour. Read `references/gotchas.md` first.
6. **Iterate narrowly.** Focused tests and formatters on touched files only; run `scripts/check-conventions.sh`.
7. **Run gates** from `references/gates.md` for every touched subsystem. A contract change means backend, dashboard, and mobile gates all run.
8. **Close on evidence.** Verify each acceptance criterion and tick it in the spec. Flip only the task's checkbox in `docs/todowork.md` to `[x]`, and only after all applicable gates pass. If a gate is blocked by the environment, leave the task incomplete and report the blocker.
9. **Review and commit locally.** `git diff --check`, inspect `git diff` and `git status`, revert unrelated formatter output, stage task files only, inspect `git diff --cached`, commit with `templates/commit-message.md` (conventional type, task number, session attribution). Let pre-commit hooks finish. Run `git status --short` afterwards.
10. **Report** using `templates/final-report.md`: SHA, decisions and inconsistencies, per-layer changes (including layers deliberately unchanged), gate table, pre-existing findings, anything left undone.

## Guardrails

- The task spec and resolved decisions are the source of truth; do not silently expand or shrink scope.
- Preserve existing user changes; avoid destructive Git or file operations; never touch remotes.
- Follow nested project instructions even when their commands differ from these defaults.
- Never claim a gate passed unless its command completed and you saw the result.
- Keep this file under 500 lines and each reference under 200; put new detail in `references/` or `templates/`.
