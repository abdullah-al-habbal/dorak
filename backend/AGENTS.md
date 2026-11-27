---
codeanchors:
  - backend/modules/
  - backend/bootstrap/
---

# Dorak Backend Guide

The one backend guide; [CLAUDE.md](CLAUDE.md) imports it. To see what exists, read the code and
[the feature index](docs/feature-index.md). `docs/02-prd.md` states intent, not current behaviour.

## Quick start

Documentation routes: [product documentation](docs/README.md) · [repository graph](../docs/index.md).

```bash
composer setup          # install + .env + key:generate + migrate + npm
composer dev            # server, queue, logs, vite concurrently
composer test           # recreates dorak_test clean, then pest sequentially (never --parallel; dorak_test is the only test database)
```

- Gates before calling work done: `vendor/bin/pint --test` and `composer test` (Pest, MySQL `dorak_test`; start it with `composer test:db:up`). Migration changes also need `php scripts/check_migrations.php`.
- CI (`.github/workflows/backend-ci.yml`) runs the migration guard, Pint, the test suite and the concurrency tests. The root `.husky/pre-push` hook runs Pint, the migration guard and the test suite (not the concurrency tests) when pushed commits change `backend/`. It works only where Git's `core.hooksPath` is `.husky/_`.

## Architecture

- **Core module** `Modules\Core` — foundation config, migrations, shared infrastructure. Feature modules (e.g. `Modules\Client`) add their own providers via `bootstrap/providers.php`.
- No `app/` or `routes/` directory. Application config is in `modules/*/Config/`; the root `config/` holds only published package config.
- `bootstrap/app.php` registers `AssignRequestUuidMiddleware` globally; API routes return JSON
- `Modules\Core\Providers\ApplicationServiceProvider::loadAppConfig()` manually `require`s every file in `modules/Core/Config/*.php` and sets config key = filename — Laravel does NOT auto-load these. It **skips when config is cached** (keys already baked into `config.php`; re-requiring would call `env()` which returns null after caching) and **preserves `app.providers`** (injected from `bootstrap/providers.php` — clobbering it breaks provider registration after `config:cache`).
- Translations loaded from `modules/Core/lang/` under `core::` namespace
- Migrations loaded from `modules/Core/Database/Migrations/`
- Error handling via `ErrorCodeEnum` (string backed) with HTTP status + `core::messages.*` lang keys
- `AssignRequestUuidMiddleware` injects UUID into every request

## Config & .env

- Rule: `env()` calls in `modules/*/Config/` take **no default** (2nd argument), and every key has a `.env.example` entry (commented out when an empty value would override a fallback). A fallback the application needs is a named constant after `??`. `tests/Feature/Core/ConfigEnvDefaultsTest.php` enforces the first part; the published files in `config/` are exempt (owner, 2026-11-27).
- `.env` is gitignored. `.env.example` is the reference.
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

## More rules

- Use PHP class attributes; models end in `Model`, actions in `Action`. Controllers are banned: use invokable Actions. Bilingual fields use Spatie Translatable. Classes are `final`.
- `BaseModuleServiceProvider` is the base of module providers and auto-mounts `Routes/Api/V1/*.php` at `/api/v1`. A module may split route files by area (for example `dashboard-admin.php`) to stay under 300 lines.
- Api response shape via `ApiResponseBodyValueObject` + `ApiResponseTrait` (paginated/ok/error). **Don't call `response()->json(`** outside Core's response trait and exception handler (guarded by `ApiResponseArchitectureTest`): domain errors extend `ConflictApiException` (409) or `ForbiddenApiException` (403); middleware and static helpers `use ApiResponseTrait`. See `docs/api-response-standard.md`.
- **Authorization is not ownership scoping.** A `where('*_id', $actor->id)` query filter is
  not an authorization check. Any Action that reads or mutates a resource another actor could
  own MUST authorize via a `*Policy` class + `$this->authorize()` / `Gate::allows()` / `->can()`.
  See `.claude/skills/laravel-native-abstractions/SKILL.md` (`references/requests-validation-authorization.md`)
  before adding or touching one of these paths — policies live under `modules/*/Policies/`; some older paths still rely on scoped queries only, so
  do not copy that pattern into new code.
  Dashboard actions authorize through `Gate::forUser($actor)->authorize('dashboard.<resource>.<ability>', ...)`;
  the abilities are defined in `DashboardServiceProvider` and implemented in `modules/Dashboard/Policies/`.
- All validation lives in a `FormRequest` (`Http/Requests/`), never inline `$request->validate()`
  in an Action/Handler — see `.claude/skills/10StrictBackendArchitecture/SKILL.md`.
- Mass assignment is blocked by `#[Fillable([...])]` on every model — never widen it to `*`.
- Eager-load exactly what a Handler/Resource will access; check query counts for N+1 (Eloquent
  strict mode is off in this repo, so nothing fails loudly on its own) — see
  `laravel-native-abstractions` → `references/eloquent-relationships.md`.
- Keep Actions/Handlers/Resolvers single-purpose: one method, roughly ≤40 lines, one class
  ≤300 lines. A Handler needing 4+ loose parameters takes a CQRS Command/Query object instead
  (already the convention — see `cqrs-pattern`).
- No magic strings/numbers for statuses, codes, or thresholds — use a Backed Enum
  (`12StrictEnums`) or a named class constant.
- Class constants live in `Modules\<Module>\Constants\<Domain>Constants` (shared values in
  `Modules\Core\Constants`), never inside the consuming class. Name them `UPPER_SNAKE` with the
  domain as prefix (`BRANCH_FLOOR_PLAN_MAX_CANVAS_SIZE`). Migration-local constants are the only exception.
- SMS goes through the `SmsSender` strategy resolved by `SmsSenderFactory` — never call a
  gateway or `Http` from a feature module. New gateways follow `docs/17-sms-delivery.md`;
  failures throw `SmsDeliveryException` (no phone/code/secrets in the message, no retries).
- Pest needs the test database up (`composer test:db:up`, `127.0.0.1:3307`) and runs sequentially, never `--parallel`.

## Feature index
After adding a feature, append entry to `docs/feature-index.md`.

## Skills
Key skills under `.claude/skills/`:
| Skill | Trigger |
|---|---|
| **Laravel 13 Attributes** (`laravel-attributes`) | **Any new PHP code.** Mandatory read before writing models, jobs, commands, requests, resources, factories, tests, DI. Full attribute reference (36 new + pre-existing). |
| **Strict Backend Architecture** (`10StrictBackendArchitecture`) | Writing Actions, Resources, Requests, or Handlers. Enforces FormRequests, Command objects, strict imports, Resource composition. |

## Protocol
1. Read `docs/feature-index.md` and the code; read `docs/02-prd.md` for intent
2. Read relevant `.claude/skills/*/SKILL.md`
3. Implement → `vendor/bin/pint --test` + `composer test` (Pest, MySQL `dorak_test`)
