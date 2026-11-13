# Stack guides

Patterns for the tools that are installed. Commands come from `gates.md` and the subsystem guides;
check them there if they differ.

## Laravel and Pest (`backend/`)

Layout: `tests/Unit` (no database), `tests/Integration`, `tests/Feature` (HTTP plus database), with
`tests/Feature/Dashboard` for the dashboard API and `tests/Feature/Architecture` for structural rules.
`tests/Pest.php` applies `Tests\TestCase` (which uses `RefreshDatabase`) to all three suites.
Support constants live in `tests/Support/Constants`.

- **Run:** `vendor/bin/pest path/to/File.php` for one file, `vendor/bin/pest --filter "name"` for a
  case, `composer test` (config clear plus `php artisan test`) for the suite. Style: `vendor/bin/pint <file>`
  then `vendor/bin/pint --test`.
- **Authentication:** `$this->authenticateDashboardActor($model)` in `tests/TestCase.php` signs in an
  admin, brand owner (a `ClientModel` that owns a brand), manager (a `BranchModel`) or barber. A client
  that owns no brand throws, so create the brand first. After switching actors in one test call
  `app('auth')->forgetGuards(); $this->flushHeaders();`.
- **Factories:** each module has `Database/Factories`; use states (`->pending()`) and pass only the
  attributes the scenario needs. Create the tenant pair (two brands, two branches) explicitly for
  isolation tests.
- **Assertions:** `assertDatabaseHas/Missing` and `->fresh()` for persistence; `assertJsonPath` and
  `assertJsonValidationErrors` for the response envelope; datasets (`->with([...])`) for validation tables.
- **Policies and middleware:** test through the route first; test a policy or Action directly when a
  job or service calls it. Policies live in `modules/*/Policies`.
- **Mail and queue:** mailables here are queued, so use `Mail::fake()` plus `Mail::assertQueued`;
  `Queue::fake()` when the dispatch is the subject. `QUEUE_CONNECTION=sync` in `phpunit.xml`
  runs jobs inline unless faked.
- **Time:** `$this->travel(2)->minutes()` for dedupe windows and expiry.
- **Failure injection:** classes marked `final` (for example `NotificationWriter`, `PlatformNotifier`)
  cannot be mocked; throw from a model event instead of removing `final`.
- **Transactions:** assert rollback by forcing the second step to fail and checking the first step's
  rows are absent.
- **Unit tests:** only for logic that needs no container state.
- **Arch tests:** structural rules go in `tests/Feature/Architecture` (for example every Http Action is routed).

## Dashboard (`frontend/web/dashboard/`)

Rules from its `AGENTS.md`: tests mirror `src/` under `tests/` (`src/lib/x.util.ts` becomes
`tests/lib/x.util.test.ts`), none inside `src/`; imports use `@/` and `@tests/`, never relative paths.

- **Vitest, `environment: "node"`:** test pure logic (utils, key factories, mappers, zod schemas),
  route handlers and the proxy (`tests/app/api`), constants and enums. Helpers live in `tests/helpers`.
- **Component tests** need jsdom and Testing Library. Both are installed, but the guide requires
  approval; do not add them by default, and enable jsdom per file only with that approval.
- **API contract:** test the zod schemas against realistic backend payloads, including the error
  envelope and the missing-field case; when the backend contract changes, update the schema test in the same task.
- **Auth and authorization:** test the proxy allow-list and session handling in `tests/app/api` and
  `tests/config`. Role gating shown in the UI never replaces a backend authorization test.
- **States:** for any screen logic that is testable without a DOM, test loading, error, empty and
  success mapping as pure functions.
- **Playwright** (`tests/e2e`): run only per `gates.md` and only where wiping the development
  database is authorised; one spec per journey; critical workflows only.
- **Run:** `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

## Flutter (`frontend/mobile/`)

A melos workspace: `apps/client_app`, `apps/business_app`, `apps/stylist_app`, `packages/core`,
`packages/design_system`, `packages/localization`. Tests are `*_test.dart` files (bloc, repository,
flow and widget tests exist) run with `flutter test` per package.

- **Unit and bloc tests:** state transitions of blocs and cubits; assert emitted states in order,
  including loading, success, empty and failure.
- **Repository and API contract:** test the repository against recorded or constructed backend
  JSON, including a missing optional field and an error envelope, so a backend response change fails here.
- **Auth and permissions:** token handling, refresh, sign-out and gate logic (`auth_bloc`,
  `app_gate`) with the failure paths.
- **Widget tests:** loading, error and empty states render and the key action is reachable.
- **Localization:** user-facing strings come from the ARBs; keep English and Arabic keys in parity and
  do not hardcode strings in tests that the UI localises.
- **Integration tests:** only for flows already covered by an existing pattern; the gate does not run a device.
- **Gate:** `dart run melos run verify` (generate, build, analyze, taxonomy, test). Format only touched files.
