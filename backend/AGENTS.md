---
nodeid: backend.guide
parentnode: repo.root
childnodes:
  - backend.claude
  - backend.docs
  - backend.process
  - backend.readme
  - backend.website
  - skills.backend
  - backend.guide.part-2
codeanchors:
  - backend/modules/
  - backend/bootstrap/
---

## Quick start

Documentation routes: [product documentation](docs/README.md) · [repository graph](../docs/index.md).

```bash
composer setup          # install + .env + key:generate + migrate + npm
composer dev            # server, queue, logs, vite concurrently
composer test           # recreates dorak_test clean, then pest sequentially (never --parallel; dorak_test is the only test database)
```

- Husky pre-push hook runs `pint --test` + `composer test` before every push; CI only checks formatting (`pint --test`). Tests are gated locally, not in CI.

## Architecture

- **Core module** `Modules\Core` — foundation config, migrations, shared infrastructure. Feature modules (e.g. `Modules\Client`) add their own providers via `bootstrap/providers.php`.
- No `app/`, `config/`, `routes/` directories
- `bootstrap/app.php` registers `AssignRequestUuidMiddleware` globally; API routes return JSON
- `Modules\Core\Providers\ApplicationServiceProvider::loadAppConfig()` manually `require`s every file in `modules/Core/Config/*.php` and sets config key = filename — Laravel does NOT auto-load these. It **skips when config is cached** (keys already baked into `config.php`; re-requiring would call `env()` which returns null after caching) and **preserves `app.providers`** (injected from `bootstrap/providers.php` — clobbering it breaks provider registration after `config:cache`).
- Translations loaded from `modules/Core/lang/` under `core::` namespace
- Migrations loaded from `modules/Core/Database/Migrations/`
- Error handling via `ErrorCodeEnum` (string backed) with HTTP status + `core::messages.*` lang keys
- `AssignRequestUuidMiddleware` injects UUID into every request

## Config & .env

- All `env()` calls in config files have **no defaults** (2nd arg removed). Every key equals a `.env` / `.env.example` entry.
- `.env` is gitignored. `.env.example` is the reference with all ~100 keys.
- `AUTH_MODEL` is hardcoded as `ClientModel::class` in auth.php — not env-driven (no backslash in .env).
- `MAIL_SENDMAIL_PATH` must be quoted in .env: `"/usr/sbin/sendmail -bs -i"` (space in value).

## Technical Concepts

Before implementing any feature, read `docs/13-technical-concepts.md` — mandatory CRUD patterns (optimistic/pessimistic updates, version locking, idempotency keys, soft delete, PATCH vs PUT, race conditions, batch operations, retry backoff, consistency models, field projection) and Flutter/Laravel integration patterns.

**Booking locks:** any code that locks booking rows takes them in one order: client, chair, barber, then the booking row (after its range scans), and never the booking row first. A lock-order inversion deadlocks (MySQL 1213, HTTP 500). A change to that order needs a process-based test in `tests/Concurrency/` that fails before the fix (see `docs/booking-concurrency/index.md` and `docs/architecture/testing-strategy.md`). `POST /bookings` takes an `Idempotency-Key` header (`Booking/Services/BookingIdempotency`); a new write endpoint that a client may retry after a lost response needs the same treatment (TD-8).

## Concurrency

Beyond the booking locks above, the same rules apply to every other write that two requests can reach at once. Findings and fix order: [docs/booking-concurrency/](../docs/booking-concurrency/09-write-path-audit.md).

- Lock parent before child, and rows of one table in ascending id.
- A set invariant ("one default", "never zero active", "one live subscription") locks the owning row (or every row of the table in id order) before it checks.
- A unique index is the guarantee; catch `UniqueConstraintViolationException` and re-read instead of letting a racy `firstOrCreate` answer 500.
- One-time codes: count the attempt first, compare in constant time, consume once (`Cache::pull`). Token rotation proceeds only if its delete removed one row.
- A change to this area needs a process-based test in `tests/Concurrency/` that asserts the end state (see the testing strategy); a sequential Pest test does not prove a race.

## Code conventions

- **Before writing ANY new code, read `.claude/skills/laravel-attributes/SKILL.md`** — full Laravel 13 attribute reference. Use attributes (not properties) for models, jobs, commands, requests, resources, factories, tests, DI.
- `declare(strict_types=1)` on every file
- Final classes for service providers and middleware
- PHP 8 attributes for Eloquent model meta (`#[Fillable]`, `#[Hidden]`, `#[Table]`, `#[Translatable]`)
- PSR-4: `Modules\\` → `modules/`, `Database\\Seeders\\` → `database/seeders/`, `Tests\\` → `tests/`
- **Dev-environment migration rule:** to change an existing table (column, index, rename), edit its original `create_*_table` migration and run `php artisan migrate:fresh --seed`; do not add `add_*`/`alter_*` fragment files. A new migration file is only for a brand-new table. (Applies while the project is pre-release; revisit before the first production deploy.)
- Test config targets the dedicated MySQL 8.4 test server (never MariaDB; `composer test:db:up` starts it on 127.0.0.1:3307, `composer test:db:down` stops it; DB `dorak_test`, connection forced by `phpunit.xml`, not by `.env.testing`), array cache/session/mail, sync queue

## Localization rules (machine keys vs labels)

- Keep `barber` in database columns, routes, DTO and JSON keys, enum values and translation keys. User-facing Arabic says **المصفف / المصففون** (never الحلاق; the trade "الحلاقة" is fine). Standard and guards: [localization of machine keys](../docs/architecture/localization-of-machine-keys.md); `tests/Feature/Core/ArabicTerminologyTest.php` fails on a regression.
- Every dashboard write route (`POST`, `PUT`, `PATCH`, `DELETE` under `api/v1/dashboard/`) must carry `ApplyPreferredLocaleMiddleware`, placed after the session check; `tests/Feature/Core/StoredLocaleWriteRoutesTest.php` enforces it. Mobile guards pass the guard name (`ApplyPreferredLocaleMiddleware::class.':barber'`).
- Every request field needs an Arabic name in `lang/ar/validation.php` (`ValidationAttributeNamesTest`); `tests/Fixtures/wire-enums.json` is kept equal to the backend enums by `WireEnumFixtureTest` and read by the dashboard and mobile tests.

## Current state (dated)

Snapshot of 2026-11-23 21:16 UTC: `master` and `origin/master` are both at `966e094a7`, released to dev with `reset_database=false` (deploy run `45267891146`, `verify-deploy.sh` 9 of 9 passed); the full Pest suite (2954 tests), Pint and the migration guard passed before the release. Live dev URLs, the release path and the open backlog items are in [dev environment status](../docs/deployment/dev-environment-status.md) and [backlog](../docs/backlog/index.md). The test database is the MySQL 8.4 container on `127.0.0.1:3307`: run `composer test:db:up` before any Pest run (a down server fails every test with "not reachable"), and never pass `--parallel`.

## Continued in

- [Part 2: Remaining Gaps (from docs/02-prd.md §5 + §8)](agents-part-2.md)
