---
name: testing
description: Test structure, database setup (MySQL, RefreshDatabase), and convention reference. Use whenever writing or running tests — unit, integration, or feature.
codeanchors:
  - backend/modules/
  - backend/tests/
---

# Testing

## Database

- All tests use a real MySQL database. SQLite is not supported and never a fallback.
- `phpunit.xml` forces the whole connection: `mysql` driver, host `127.0.0.1`, port `3307`, user `root`, the container's throwaway password and `DB_DATABASE=dorak_test` (`.env.testing` cannot redirect it). `Tests\Support\TestDatabaseGuard` throws before `migrate:fresh` unless the run is sequential and `APP_ENV`, driver, database name, host (no socket), port 3307, user and server version (MySQL 8.4 only) are all the test values; with no server running it tells you to run `composer test:db:up`. Two-connection tests live in `tests/Concurrency` (group `concurrency`, excluded from the default run because they commit rows): `composer test:concurrency`. **Policy:** `dorak_test` is the only test database, on MySQL 8.4 only (MariaDB and other versions are refused; `composer test:db:up` starts it on 127.0.0.1:3307, `composer test:db:down` stops only that container); tests run sequentially; `--parallel` and per-worker databases are prohibited (the guard refuses them before anything is created); `composer test` recreates `dorak_test` clean first (`composer test:reset`); changing this needs explicit approval.
- The `RefreshDatabase` trait is applied via the base `Tests\TestCase`, guaranteeing a clean state for every test.

## Test structure

Tests live in the root `tests/` directory mirroring module namespace paths:

```
tests/
├── Unit/Core/...        ← no database; pure logic
├── Integration/Core/... ← database-backed (RefreshDatabase)
├── Feature/Core/...     ← HTTP + database (RefreshDatabase)
├── TestCase.php         ← base test case (applies RefreshDatabase)
└── Pest.php             ← applies TestCase to Unit/Integration/Feature
```

## Running tests

```bash
php artisan test                    # all tests
php artisan test --filter Core      # Core-related tests only
php artisan test --testsuite Unit   # unit tests only
```

## Conventions

- Never call `env()` in test code — use `config()`.
- Pest syntax with `uses(Tests\TestCase::class)` applied automatically via `tests/Pest.php`.
- Unit, Integration, Feature tests all boot the Laravel app via `TestCase`.
- Mockery for mocking. Final classes should omit `final` if they need mocking in tests.
