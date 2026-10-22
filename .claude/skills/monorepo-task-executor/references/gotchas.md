# Gotchas learned from past tasks

- Broadcast events are queued: under `Queue::fake()` assert the specific job (`assertPushed(Job::class, n)`, `assertNotPushed(Job::class)`), not `assertNothingPushed()`.
- Dispatch notifications and broadcasts after the DB transaction commits, never inside it.
- Use `lockForUpdate` in a transaction when a check and a write must be atomic.
- `ApiResponseBodyValueObject` drops an empty `meta`; pick between `data`, `meta`, and `errors` deliberately.
- Dashboard API tests need the real bearer token plus a signed `X-Dashboard-Session` (`authenticateDashboardActor`), not `actingAs` alone.
- PHPStan collection generics do not prove `list<...>`; build lists with `array_values` / `array_map`.
- Dart fakes: implement every abstract method explicitly. A `noSuchMethod` that returns a failed future produces unhandled async errors.
- Pre-commit hooks run eslint/prettier/typecheck on staged dashboard files and may restage them; let them finish and never bypass.
- Stage task files only. Formatters and generators often touch unrelated files; revert those before committing.
