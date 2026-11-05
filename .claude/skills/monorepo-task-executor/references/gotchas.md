---
nodeid: skills.repo.monorepo-task-executor.references.gotchas
parentnode: skills.repo.monorepo-task-executor
childnodes: []
codeanchors:
  - backend/
  - frontend/web/dashboard/
  - frontend/mobile/
---

# Gotchas learned from past tasks

- Broadcast events are queued: under `Queue::fake()` assert the specific job (`assertPushed(Job::class, n)`, `assertNotPushed(Job::class)`), not `assertNothingPushed()`.
- Dispatch notifications and broadcasts after the DB transaction commits, never inside it.
- Use `lockForUpdate` in a transaction when a check and a write must be atomic.
- `ApiResponseBodyValueObject` drops an empty `meta`; pick between `data`, `meta`, and `errors` deliberately.
- Dashboard API tests need the real bearer token plus a signed `X-Dashboard-Session` (`authenticateDashboardActor`), not `actingAs` alone.
- PHPStan collection generics do not prove `list<...>`; build lists with `array_values` / `array_map`.
- Dart fakes: implement every abstract method explicitly. A `noSuchMethod` that returns a failed future produces unhandled async errors.
- The pre-commit hook runs eslint and typecheck when dashboard files are staged, and `commit-msg` enforces the conventional-commit header; let them finish and never bypass.
- Stage task files only. Formatters and generators often touch unrelated files; revert those before committing.
- Gateway/vendor integrations: use a strategy contract plus a factory, config-driven with fail-fast validation; no retries on non-idempotent sends; never put PII, codes or secrets in exception messages; purge any cached secret (e.g. OTP) when delivery fails.
- Pint may fail on a file you did not touch (pre-existing working-tree edit). Run it on touched paths, report the unrelated failure, and never reformat or stage that file.
- Do not claim another layer (mobile, dashboard) is unaffected without inspecting it; state what you checked and what you did not run.
- Pest `arch()`: exclude the contract interface and the factory when asserting on implementations (`->ignoring(...)`).
