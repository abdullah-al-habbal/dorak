---
nodeid: skills.repo.monorepo-task-executor.references.gates
parentnode: skills.repo.monorepo-task-executor
childnodes: []
codeanchors:
  - backend/
  - frontend/web/dashboard/
  - frontend/mobile/
---

# Quality gates

Run each from the stated directory. Never claim a gate passed unless the command completed and you saw the result.

## Backend (`backend/`)
- Full suite: `php artisan test`. On the memory ceiling: `php -d memory_limit=-1 vendor/bin/pest`.
- Focused: `php -d memory_limit=1G vendor/bin/pest tests/Feature/...`.
- Style: `vendor/bin/pint <touched paths>`, then `vendor/bin/pint --test <touched paths>`.
- Migrations: also `php scripts/check_migrations.php`.
- PHPStan is explicitly exempted as a required gate for this repo (see `backend/CLAUDE.md`) —
  do not run or report it as a blocking check. `pint --test` and `php artisan test`/Pest remain
  mandatory.
- Authorization: for any touched Action that reads or mutates another actor's resource,
  confirm a `*Policy` + `$this->authorize()`/`Gate::allows()`/`->can()` check exists — a scoped
  query alone (`where('*_id', ...)`) does not satisfy this gate.

## Dashboard (`frontend/web/dashboard/`)
Whenever dashboard code, copy, or contracts change, run from that directory: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

### Playwright E2E (mandatory dashboard gate)
- Run from `frontend/web/dashboard/` after lint, typecheck, `npm test` and build pass: `TZ=UTC npx playwright test tests/e2e/<spec>.spec.ts` for the task's spec(s), then the whole suite `TZ=UTC npx playwright test` when shared code (hooks, proxy, overlays, nav, seeder, locales) changed. `TZ=UTC` is mandatory: the backend clock is UTC, and a local-zone browser disagrees with the seeded "today" between 00:00 and 03:00 local time.
- Production build only: the config starts `npm run build && npm start` (600 s timeout) because `next dev` fetches Google Fonts at runtime and fails in sandboxed runs. It reuses any server on port 3000, so first check `ss -ltn | grep -E ':(3000|8000)\b'` and stop a running `next dev`.
- Read the real result line (`N passed` / `N failed`), not the exit code of a pipe such as `| tail`, which reports success even when tests fail.
- The global setup runs `migrate:fresh --seed` plus `E2eDashboardSeeder` on the dev database. Only run it where the user has authorised wiping that database; otherwise stop and ask.
- Every task that touches the dashboard adds or updates a spec under `tests/e2e/`, and extends `E2eDashboardSeeder` if it needs data (keep the seeder idempotent).
- It must pass fully, on every configured project (desktop, mobile-390, ultrawide-3440). A failure, a flaky pass that needed a retry, or an environment block means **no commit**: fix and rerun, or report the blocker and leave the task incomplete. Never skip, `.only`, or weaken a test to get green.

## Mobile (`frontend/mobile/`)
- Whenever `core`, `localization`, or any app changes: `dart run melos run verify`.
- After editing ARBs: `flutter gen-l10n` in `packages/localization`; commit the generated output.
- `dart format` only on touched files. Workspace-wide formatting rewrites unrelated files; revert any it modifies.

## Order of gates
Preflight audit, feasibility council (`../llm-council/SKILL.md`, medium and complex tasks), implementation, backend Pest and Pint, dashboard lint, typecheck, Vitest and build, **Playwright E2E**, mobile `melos verify`, `scripts/check-conventions.sh`, the security review (`references/security-review.md`), hygiene cleanup, then the commit. Each step runs only if the previous passed.

## Repository rules
`scripts/check-conventions.sh` flags relative imports, inline FQCNs, and missing `strict_types`, and runs `git diff --check`.
