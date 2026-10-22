# Quality gates

Run each from the stated directory. Never claim a gate passed unless the command completed and you saw the result.

## Backend (`backend/`)
- Full suite: `php artisan test`. On the memory ceiling: `php -d memory_limit=-1 vendor/bin/pest`.
- Focused: `php -d memory_limit=1G vendor/bin/pest tests/Feature/...`.
- Style: `vendor/bin/pint <touched paths>`, then `vendor/bin/pint --test <touched paths>`.
- Static: `vendor/bin/phpstan analyse --memory-limit=2G --no-progress --debug <touched production PHP paths>` (never migrations or tests).
  - Compare with a baseline; report pre-existing findings separately and fix new ones.
  - If removed code was covered by `phpstan-baseline.neon`, delete the now-unmatched entries (`ignore.unmatched` cannot be ignored). Entries include an `identifier:` line.
- Migrations: also `php scripts/check_migrations.php`.

## Dashboard (`frontend/dashboard/`)
Whenever dashboard code, copy, or contracts change: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. Do not assume a `new/` subdirectory.

## Mobile (`frontend/mobile/`)
- Whenever `core`, `localization`, or any app changes: `dart run melos run verify`.
- After editing ARBs: `flutter gen-l10n` in `packages/localization`; commit the generated output.
- `dart format` only on touched files. Workspace-wide formatting rewrites unrelated files; revert any it modifies.

## Repository rules
`scripts/check-conventions.sh` flags relative imports, inline FQCNs, and missing `strict_types`, and runs `git diff --check`.
