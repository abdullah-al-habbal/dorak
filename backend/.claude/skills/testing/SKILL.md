---
name: testing
description: Test structure, database setup (MySQL, RefreshDatabase), and convention reference. Use whenever writing or running tests — unit, integration, or feature.
nodeid: skills.backend.testing
parentnode: skills.backend
childnodes: []
codeanchors:
  - backend/modules/
  - backend/tests/
---

# Testing

## Database

- All tests use a real MySQL database. SQLite is not supported and never a fallback.
- `phpunit.xml` forces `DB_CONNECTION=mysql` and `DB_DATABASE=dorak_test`; host and credentials come from `.env.testing` (CI: environment). `Tests\Support\TestDatabaseGuard` throws before `migrate:fresh` for any other driver or database name.
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
