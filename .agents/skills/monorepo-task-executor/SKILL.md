---
name: monorepo-task-executor
description: Executes and closes document-routed engineering tasks in the Dorak Operations monorepo with full vertical consistency, local quality gates, and a local-only commit. Use when asked to run, implement, process, complete, or close a Dorak task such as "Task 02", "next task", or a task specification under docs/tasks/.
---

# Monorepo Task Executor

Use for requests such as: `Run Task 02 according to docs/tasks/task-02-client-history-ownership.md.`

## Workflow

1. **Establish the workspace.** Run `git status --short`; preserve unrelated edits and avoid staging them. Never push, edit remotes, or use `--no-verify`.
2. **Audit the task.** Read `docs/todowork.md`, the full task specification, `docs/decisions-required.md`, and every applicable `AGENTS.md`, project guide, linked decision, and architecture reference. Record resolved decisions in both the decision tracker and task spec. Call out contradictory acceptance criteria and reconcile them against the domain authorization model before implementation.
3. **Define the vertical slice.** Identify affected backend, dashboard, mobile, docs, tests, migrations, API contracts, and out-of-scope areas. Do not add client work when the spec says no changes are needed; still verify any named client behavior.
4. **Implement with local conventions.** Keep imports/dependencies at file tops and obey project path rules. Add regression tests for both allowed and rejected behavior. Reuse project authentication helpers and test harnesses; dashboard API tests may require the real bearer token plus signed `X-Dashboard-Session`, not `actingAs` alone.
5. **Iterate narrowly.** Run focused tests and formatters for touched code. Check for accidental relative imports, inline imports/FQCNs, and unrelated changes.
6. **Run applicable gates from the repository root unless noted:**
   - Backend: `cd backend && php artisan test`. If the Artisan wrapper hits the PHP memory ceiling, use `php -d memory_limit=-1 vendor/bin/pest`. For focused Pest runs use `php -d memory_limit=1G vendor/bin/pest tests/Feature/...` (the Artisan wrapper may misparse forwarded file arguments).
   - Backend static/style checks required by the spec: from `backend/`, run `vendor/bin/phpstan analyse --memory-limit=2G --no-progress --debug <touched production PHP paths>` and `vendor/bin/pint --test <touched PHP paths>`. `--debug` avoids PHPStan worker socket failures in restricted environments. The repository PHPStan config excludes migrations and tests, so do not pass those paths. Report existing unrelated baseline findings separately.
   - Dashboard: only if touched or required by the spec, from `frontend/dashboard/`, run `npm run lint`, `npm run typecheck`, `npm test` when defined/required, and `npm run build`. Do not assume a `new/` subdirectory.
   - Mobile: from `frontend/mobile/`, run the documented `dart run melos run verify` gate when required by package guidance; run `dart run melos run test` when the task requires mobile tests. For a narrowly affected package, run its documented Flutter test/analyze commands as well.
7. **Close the task only on evidence.** Confirm acceptance criteria and applicable gates. Change only the task's checkbox in `docs/todowork.md` to `[x]` after completion. If a gate is blocked by the environment, preserve the task as incomplete and report the blocker.
8. **Review and commit locally.** Run `git diff --check`; inspect `git diff` and `git status`. Stage only task files (never blindly stage unrelated work), inspect `git diff --cached`, then commit with a conventional type and task number, e.g. `fix(security): protect client history ownership (Task 02)`. Run `git status --short` afterward and report the local commit SHA and gates. Never run a remote operation.

## Guardrails

- The task spec and resolved decisions are the source of truth; do not silently expand scope.
- Preserve existing user changes and avoid destructive Git/file operations.
- Follow nested project instructions even when their prescribed commands differ from these defaults.
- Never claim a gate passed unless its command completed successfully.
