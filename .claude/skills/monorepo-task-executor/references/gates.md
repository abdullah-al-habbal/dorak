---
nodeid: skills.repo.monorepo-task-executor.references.gates
parentnode: skills.repo.monorepo-task-executor
childnodes: []
codeanchors:
  - backend/
  - frontend/web/new-dashboard/
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

## Dashboard (`frontend/web/new-dashboard/`)
Whenever dashboard code, copy, or contracts change, run from that directory: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. `archive/` is read-only history and is never part of a gate.

## Mobile (`frontend/mobile/`)
- Whenever `core`, `localization`, or any app changes: `dart run melos run verify`.
- After editing ARBs: `flutter gen-l10n` in `packages/localization`; commit the generated output.
- `dart format` only on touched files. Workspace-wide formatting rewrites unrelated files; revert any it modifies.

## Repository rules
`scripts/check-conventions.sh` flags relative imports, inline FQCNs, and missing `strict_types`, and runs `git diff --check`.
