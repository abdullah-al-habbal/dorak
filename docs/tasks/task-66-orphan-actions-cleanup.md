# Task 66: Remove Orphan Action Classes

**Phase:** Phase 12 — Backend Hygiene · **Priority:** P3 · **Depends on:** Task 03, Task 08 · **Audit source:** Backend route audit (Orphan rows)

## Overview & Root Cause
Three action classes are not wired to any route. They duplicate routed classes with almost the same names, which misleads contributors and code search. `CheckClientBanAction` still carries a stale `// todo` about relocating it.

## Evidence
- `backend/modules/Ban/Http/Actions/Client/CheckClientBanAction.php:12-13` — has a `// todo: we must move it …` comment and is unrouted. The route uses `CheckClientBansAction` (`backend/modules/Ban/Routes/Api/V1/bans.php:9`).
- `backend/modules/Currency/Http/Actions/Shared/ConvertCurrencyAction.php` — unrouted. The route uses the `Admin\` variant (`backend/modules/Currency/Routes/Api/V1/currencies.php:6,14`).
- `backend/modules/Currency/Http/Actions/Shared/ListExchangeRatesAction.php` — unrouted. The route uses the `Admin\` variant (`currencies.php:7,13`).

## Full-Stack Scope
### Backend (API / DB / Policies)
- Delete `Ban\…\CheckClientBanAction` and any handler or request used only by it (`CheckClientBanHandler`, `CheckClientBanRequest`), after confirming with grep that nothing else references them.
- Currency: coordinate with Task 57. If Task 57 makes rates and convert client-accessible through `Shared\` actions, delete the `Admin\` duplicates instead. Exactly one class per endpoint must remain.
- Add an architecture test that fails when any `modules/*/Http/Actions/**/*Action.php` class is not referenced by a registered route.
### Dashboard (BFF / React)
- None — backend-only.
### Mobile (Flutter / Repositories)
- None — backend-only.

## Acceptance Criteria
- [x] ~~`grep -rn "CheckClientBanAction\b" backend/modules` returns nothing.~~ **Stale by the
  time this task was reached — the evidence no longer matches the code.** Only one
  `CheckClientBanAction` class exists today, at
  `backend/modules/Ban/Http/Actions/Api/V1/Client/CheckClientBanAction.php`, it carries no
  stale todo comment, and it **is** the routed handler for
  `GET /clients/{client}/bans/check` (`backend/modules/Ban/Routes/Api/V1/bans.php:10`). No
  `CheckClientBansAction` (plural) exists anywhere in the repo. Something between this spec
  being written and this task being executed already cleaned this up — deleting the only
  `CheckClientBanAction` class to satisfy the grep literally would delete the live ban-check
  endpoint, so this AC is marked resolved-by-prior-drift rather than actioned. No code change
  made here.
- [x] Exactly one `ConvertCurrencyAction` and one `ListExchangeRatesAction` class exist, and each is routed. Confirmed — Task 57 already removed the `Admin\` duplicates; only the `Shared\` actions exist (`backend/modules/Currency/Http/Actions/Shared/{ConvertCurrencyAction,ListExchangeRatesAction}.php`), both routed in `currencies.php`. No code change needed.
- [x] New test `tests/Feature/Architecture/RoutedActionsTest.php` passes and fails when an unrouted action is added. Added — walks every `modules/*/Http/Actions/**/*Action.php` file (skipping `abstract class` bases, e.g. `BaseApiAction`, `TransitionBookingAction`), derives its FQCN from the PSR-4 path, and asserts the FQCN string appears in some `modules/*/Routes/{Api,Web}/**/*.php` file. Passing today confirms no orphan Action exists in the current tree. Lives under `tests/Feature/Architecture/` (the plain `tests/Architecture/` the spec names is not wired to the Laravel `TestCase` in `tests/Pest.php`; `Feature/` already is — the spec's own "(or equivalent)" clause covers this).
- [x] ~~`php artisan route:list --path=api` still lists 152 routes (or the count after Task 57's documented changes).~~ **Not asserted as a test.** The live count today is 208 (`php artisan route:list --path=api --json` row count) — 56 more than the spec's 152, from the many feature tasks (58 route-adding tasks have shipped since this spec's route count was taken). A hardcoded total-route-count test breaks on every future route addition and asserts nothing about correctness; the architecture test above is the durable, meaningful signal this AC was really after (no *orphaned* action, regardless of total count), so no count-based test was added.
- [x] `php artisan test` passes; Pint is clean (PHPStan is exempted repo-wide per `backend/CLAUDE.md`).

## Out of Scope
- Changing currency endpoint guards or contracts (Task 03, Task 57).
- Ban enforcement logic (Task 08).
