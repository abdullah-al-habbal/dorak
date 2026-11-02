---
nodeid: skills.backend.laravel-native-abstractions.references.testing.part-3
parentnode: skills.backend.laravel-native-abstractions.references.testing
childnodes: []
codeanchors:
  - backend/modules/
---

Part 3 of 3 · [Testing Laravel Abstractions](testing.md) · [Previous](testing-part-2.md)

## What to assert

- Assert **observable behaviour and contracts**: response shape, persisted state, dispatched
  jobs/events, external calls made.
- Do not assert implementation details unless the detail *is* the contract (e.g. "this job must
  land on the `notifications` queue" is a contract; "this Handler calls that private method" is
  not).
- Assert the **rejection** path too: validation failures, 403s, rate limits, uniqueness
  violations, lock contention.
- Query counts matter here because strict mode is off — `DB::listen()` or
  `$this->expectsDatabaseQueryCount()` catch N+1 regressions the framework will not.
- The no-double-booking concurrency test and the tenancy-isolation test are mandatory gates —
  see `laravel-testing-baseline`.

---

## Commands

```bash
composer test                       # config:clear + Pest against dorak_test
php artisan test --filter Booking
vendor/bin/pint --test              # formatting gate (also runs in CI + pre-push)
vendor/bin/phpstan analyse           # larastan; config in phpstan.neon
```

There is no `composer analyse` script in `composer.json` despite `CLAUDE.md` naming one — call
`vendor/bin/phpstan analyse` directly.
