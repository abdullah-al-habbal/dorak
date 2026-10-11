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
- [ ] `grep -rn "CheckClientBanAction\b" backend/modules` returns nothing.
- [ ] Exactly one `ConvertCurrencyAction` and one `ListExchangeRatesAction` class exist, and each is routed.
- [ ] New test `tests/Architecture/RoutedActionsTest.php` (or equivalent) passes and fails when an unrouted action is added.
- [ ] `php artisan route:list --path=api` still lists 152 routes (or the count after Task 57's documented changes).
- [ ] `php artisan test` passes; PHPStan max and Pint are clean.

## Out of Scope
- Changing currency endpoint guards or contracts (Task 03, Task 57).
- Ban enforcement logic (Task 08).
