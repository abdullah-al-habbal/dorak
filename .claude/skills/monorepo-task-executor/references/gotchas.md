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
- Dart fakes: implement every abstract method explicitly. A `noSuchMethod` that returns a failed future produces unhandled async errors.
- The pre-commit hook runs eslint and typecheck when dashboard files are staged, and `commit-msg` enforces the conventional-commit header; let them finish and never bypass.
- Stage task files only. Formatters and generators often touch unrelated files; revert those before committing.
- Gateway/vendor integrations: use a strategy contract plus a factory, config-driven with fail-fast validation; no retries on non-idempotent sends; never put PII, codes or secrets in exception messages; purge any cached secret (e.g. OTP) when delivery fails.
- Pint may fail on a file you did not touch (pre-existing working-tree edit). Run it on touched paths, report the unrelated failure, and never reformat or stage that file.
- Do not claim another layer (mobile, dashboard) is unaffected without inspecting it; state what you checked and what you did not run.
- Pest `arch()`: exclude the contract interface and the factory when asserting on implementations (`->ignoring(...)`).
- `npm run clean:artifacts` deletes `.next/`, which holds Next's generated `LayoutProps`/`PageProps` types, so the pre-commit typecheck fails right after cleanup. Run `cd frontend/web/dashboard && npx next typegen` after the cleanup and before committing.
- The E2E seeder creates subscriptions through a factory, which does not sync Pennant brand flags; call `PlanFeatureSyncer::grant()` when a spec needs a plan feature such as `multi_branch`.
- E2E seeder: never pass `Model::factory()->make([...])->getAttributes()` into `firstOrCreate` for a translatable model. `getAttributes()` returns the JSON-encoded column, Spatie stores that string again as one locale, and names render as raw `{"en":...}`. Use `Model::factory()->raw([...])`. Specs match seeded names exactly; never loosen a locator to tolerate bad seed data.
- E2E seeder resets must undo every row a spec creates outside the seeded brand too (for example the subscriptions spec assigns a plan to another brand). Otherwise the next Playwright project sees leftovers and fails. Cover each reset rule with a Pest test in `tests/Feature/Seeders/`.
- E2E seeder: `fake()->unique()` is unique only within one process, and every `resetBackend()` is a new `artisan` process, so a nested factory relation (a review's author, a brand's owner or currency) adds a random row per reseed that eventually collides on a unique column. Pass seeded ids for every relation. The reset runs in one `DB::transaction` so a failed reseed keeps the previous baseline; restore any field a spec toggles (`updateOrCreate`, not `firstOrCreate`).
- Dashboard hooks cannot be rendered in Vitest (Node, no jsdom). Put the logic in a `lib/*.util.ts` and test TanStack mutation options through a real `QueryClient` plus `MutationObserver`, with `vi.mock("sonner")`.
- Next "unstable value `Date.now()` while prerendering": with `cacheComponents` and `partialPrefetching`, a runtime prefetch resolves cookies but still forbids clock reads, so reading `cookies()` first is not enough. Call `await connection()` (`next/server`) before the read in the server-only caller (the portal's `loadSession` before `verifyClaim`), not in shared utils that the proxy also runs. To find the source, map the minified stack frame through the `.next/server/chunks/ssr/*.js.map` source map.
- Factories that draw from a small Faker pool with `unique()` (currency codes) must also skip values already stored by seeders: `unique()` never sees rows that `CurrencySeeder` inserted (SYP, USD), so `migrate:fresh --seed` failed at random on `currencies_code_unique`. `CurrencyFactory` now loops until the code is free; fix such a pool in the shared factory, not with `firstOrCreate` in each caller.
