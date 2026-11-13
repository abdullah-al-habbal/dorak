---
name: test-engineering
description: "Cross-stack test engineering for the Dorak monorepo (Laravel/Pest backend, Next.js dashboard with Vitest and Playwright, Flutter apps via melos). Use whenever writing, reviewing, fixing or expanding tests: 'write tests', 'add a regression test', 'review these tests', 'coverage matrix', 'cross-tenant', 'authorization matrix', 'mutation testing', 'flaky test', 'is this covered', and whenever a change touches authorization, tenant scope, state transitions, money or external integrations. Gives the risk-based method, the actor and tenant checks, the effectiveness review, the 14-step workflow and the coverage-matrix format. Not a replacement for the backend testing skills or the task executor gates."
---

# Test engineering

An instruction set for agents and developers, enforced by review: every rule below is something a
reviewer can check in a diff. There is no script, hook or CI job behind it (see
[Enforcement](#enforcement)). Passing tests never prove a feature is covered; this skill defines
what "covered" has to mean and how to report it honestly.

## Precedence and scope

Read these first when the area applies; this skill adds a cross-stack layer and does not replace them.

| Topic | Authority (wins on conflict) |
| --- | --- |
| Backend test database, `RefreshDatabase`, Pest layout | `backend/.claude/skills/testing`, `backend/AGENTS.md`, `backend/CLAUDE.md` |
| Which docs rule or edge case needs a test | `backend/.claude/skills/laravel-testing-baseline` (the docs-to-tests map only; its "SQLite :memory:" line is stale, see below) |
| Gate commands and their order | `../monorepo-task-executor/references/gates.md` |
| Feasibility of a task | `../llm-council/SKILL.md` |
| Security review of a diff | `../monorepo-task-executor/references/security-review.md` |
| Dashboard test rules | `frontend/web/dashboard/AGENTS.md` ("Testing and gates") |
| Mobile test rules | `frontend/mobile/CLAUDE.md` and the guide in the app or package |

This skill never edits those files. It does not duplicate the task executor's gates; it says what the
tests inside those gates must prove.

## Verified facts (re-check before relying on them)

Facts below were checked on 2026-11-13. Each has a command; run it when the fact decides your plan.
If the output differs, trust the output and report the drift.

| Fact | Check |
| --- | --- |
| Backend tests run on MySQL `dorak_test` (via gitignored `.env.testing`). `phpunit.xml` sets `DB_CONNECTION=sqlite` with non-forced `<env>`, which `APP_ENV=testing` overrides; `laravel-testing-baseline` still says SQLite and is wrong. CI uses a MySQL 8 service. | `cd backend && APP_ENV=testing php artisan tinker --execute='echo config("database.default");'`, and `.github/workflows/backend-ci.yml` |
| Pest 3.8.x on PHPUnit 11 | `cd backend && vendor/bin/pest --version` |
| No code coverage driver is loaded, so `pest --coverage` and `--mutate` cannot run here | `php -m \| grep -i -E "pcov\|xdebug"` |
| `phpunit.xml` `<source>` includes `app`, which does not exist (code lives in `modules/`), so coverage numbers would be meaningless until it is fixed | `ls backend/app` |
| `infection/infection` is not installed. Packagist lists 0.35.x requiring PHP ^8.3; it was queried, never installed, so compatibility with this PHP/Pest combination is unverified | `cd backend && composer show infection/infection --all` |
| `pestphp/pest-plugin-mutate` 3.0.x is installed as a Pest dependency and unused; `pest --mutate` needs `mutates()` or `covers()` in tests and a coverage driver | `composer show pestphp/pest-plugin-mutate`; `grep -rn "mutates(" backend/tests` |
| Backend test helpers are global functions declared in test files (142 on this date, no duplicates); a duplicate name is a fatal error for the whole suite | `grep -rhoE "^function [A-Za-z0-9_]+" backend/tests \| sort \| uniq -d` |
| Dashboard Vitest runs `environment: "node"`; jsdom and Testing Library are installed, but component tests need approval | `frontend/web/dashboard/vitest.config.mts`, its `AGENTS.md` |
| Mobile gate is `dart run melos run verify` (generate, build, analyze, taxonomy, test) | `frontend/mobile/pubspec.yaml` `melos.scripts` |
| No markdown linter, link checker or Mermaid validator exists in the repo | `ls frontend/web/dashboard/node_modules/.bin \| grep -i -E "markdownlint\|mermaid"` |

## 1. Risk-based strategy

Spend effort where a defect costs most. Rank the work, then test top-down; stop when the
remaining risk is documented, not when a test count is reached.

1. Security and authorization: who may do this, and who may not.
2. Cross-tenant and branch isolation: another brand's or branch's data must stay unreachable.
3. Financial operations and data integrity: payments, commissions, payouts, currency, uniqueness.
4. Business-critical workflows and state transitions: bookings, brand and barber lifecycles.
5. External integrations and failure handling: mail, SMS, payment gateways, queues.
6. Regression risk: code that broke before, shared helpers, wide fan-out.
7. Everything else (presentation, convenience filters).

Test count is not a goal. One test that proves an authorization boundary outweighs ten that re-assert
a 200.

## 2. Test pyramid

| Layer | Use it for | Tool here |
| --- | --- | --- |
| Unit | Pure logic with no framework state: calculators, mappers, enums, schemas | Pest `tests/Unit`; Vitest `tests/**/*.test.ts`; `flutter test` |
| Feature / integration | HTTP route through Action, Handler and database, with real persistence | Pest `tests/Feature`, `tests/Integration` (MySQL) |
| Authorization and security | Every actor against every changed route; tenant ids; scope | Pest Feature tests (see section 4) |
| API contract | Response shape the dashboard and mobile apps depend on | Pest `assertJsonStructure`/`assertJsonPath`; dashboard zod schema tests; mobile repository tests |
| End to end | A user journey across the real stack | Playwright, dashboard only, per `gates.md` |

Prefer the lowest layer that can prove the behaviour. Do not mock what should be integration-tested
(the database, policies, middleware, the Action/Handler chain). Mock only the outside world
(`Mail::fake()`, `Http::fake()`, `Queue::fake()`, `Notification::fake()`, `Event::fake()` when the
event is not the thing under test).

## 3. Quality criteria per feature

Evaluate each applicable criterion; one test may satisfy several. Add a test only for an uncovered
criterion, never to fill the list.

Happy path; input validation; authentication; authorization; cross-tenant isolation; business rules;
state transitions; database integrity; failure scenarios; side effects; regression prevention.

Record "not applicable" with the reason in the matrix instead of inventing a test.

## 4. Authorization matrix

Actors in this repo: platform **Admin**, **Brand Owner** (a client account with a dashboard
capability derived from owning a brand, not a role flag: `docs/adr/0001-brand-owner-as-client.md`),
branch **Manager** (the branch account), **Barber** (stylist), **Client**, and **Guest**
(unauthenticated). Not every actor applies to every feature.

Derive the expected result per actor; never invent or change a permission without explicit approval.

1. Read the sources in this order: the route group and its middleware (`modules/*/Routes/Api`),
   the Action and FormRequest `authorize()`, the `*Policy` classes (`modules/*/Policies`), the
   actor model `modules/Dashboard/Support/DashboardActor.php` (`can`, `canManageBrand`), the PRD and
   house rules in `backend/docs`, and ADR 0001.
2. Fill one row per actor with the status the code returns (401, 403, 404, 422, 2xx).
3. If no source defines an actor's access, write `undefined` and ask. Do not guess, and do not
   assert a status the code merely happens to return as if it were a requirement.
4. If sources disagree (a policy says deny, a route allows), report it; do not normalise it in a test.
5. Assert the behaviour the code returns today, and list inconsistent statuses (403 vs 404 for the
   same kind of denial) as findings rather than hiding them.

Test authorization at the boundary the actor crosses: the HTTP route, and the policy or action
directly when it is called from a job or another service. A scoped query alone does not prove
authorization (`gates.md`).

## 5. Cross-tenant isolation

Treat as a security requirement, tested before convenience cases. For each changed endpoint:

- **Resource ids:** another tenant's id in the URL returns the denial the code defines and changes nothing.
- **Tenant identifiers in the body or query:** swap `brand_id`, `branch_id`, `owner_id`, `serviceable_id`
  and `chair_id` to another tenant's values; the request is rejected or ignored, and the other tenant's
  rows are unchanged afterwards (assert the database, not only the status).
- **Lists and search:** a filter narrows an actor's scope and never widens it; search with `%` and `_`
  stays literal; pagination `per_page` cannot be used to pull other rows.
- **Nested resources:** a child id from tenant B under a parent id from tenant A.
- **Relationship manipulation:** attach, detach, reassign and bulk routes cannot move a row across tenants.
- **Read, create, update, delete:** all four, where the route exists.
- **Background paths:** jobs, notifications and scheduled commands that read tenant data keep the same scope.
- **Actor identity switch:** two actors with overlapping id spaces (an owner and a barber) cannot read
  each other's rows.

## 6. Lifecycle and business logic

For each state change, test the allowed transitions and every forbidden one. Verify together: the
precondition, who may do it, the new persisted state, the forbidden fields left untouched, audit rows,
notifications and mail (`Mail::assertQueued` because mailables here are queued), the rejection body,
and atomicity: when a step fails mid-way, nothing partial remains. A final HTTP status alone is not a lifecycle test.

## 7. Failure and reliability

Add a failure test only when the feature has the failure mode: external service errors, mail or
notification failure (a side-effect failure must not roll back the business action when the code is
designed that way, or must when it is not), payment failure, duplicate submission and idempotency,
expired or invalid tokens, retries, concurrent updates, transaction rollback, partial failure. To force
a failure in a `final` class that cannot be mocked, throw from a model event (for example
`NotificationModel::creating(fn () => throw new RuntimeException(...))`) instead of changing the class.

## 8. Database integrity and MySQL

Backend tests already run on MySQL (verified above), so engine behaviour is exercised. Still verify:
foreign keys and cascade rules, unique constraints, orphan prevention, soft deletes, transaction
rollback and concurrent writes. Concurrency (double booking, two simultaneous approvals) needs
real overlapping connections; a single-process test does not prove it, so mark it `unverified` until
a parallel or two-connection test exists. Never assume SQLite results transfer to MySQL if a suite or
a developer overrides `DB_CONNECTION`. Tests use `dorak_test` only; never point them at the
development database `dorak_backend_development_db`, and never run `migrate:fresh` against it.

## 9. Test effectiveness review

Before finishing, for each test ask: if the feature regressed in the way this test targets, would it
fail? Check that the test asserts:

- the persisted state (`assertDatabaseHas/Missing`, `->fresh()`), not only the response;
- the forbidden state change did not happen (another tenant's row, an unchanged field);
- the exact status and error key for the boundary;
- the side effect (queued mail, notification row, audit row) or its absence;
- a value that distinguishes correct from incorrect (an assertion that passes on empty data is weak).

For a high-risk rule, prove the test can fail: temporarily break the rule locally (or run the
mutation tool where approved), confirm the test goes red, then restore the code. Never commit the break.

## 10. Coverage and mutation

State what was measured. Line coverage shows what ran, branch coverage what decisions ran; neither
shows that a fault would be caught, and a percentage is never proof of quality.

- Today **no coverage driver** is installed, so neither coverage nor mutation can run here, and no
  step in this skill treats them as a gate.
- Mutation testing is a proposal that needs user approval: first fix `phpunit.xml` `<source>` to
  `modules`, install a driver (pcov is lighter than Xdebug), then trial Pest's own `--mutate` on
  a small critical service with `mutates()`, because the plugin is already present. Evaluate
  `infection/infection` only after that, from the `composer show` result, and install nothing without approval.
- Start with critical services and business rules, not the whole suite.

## 11. Isolation and maintainability

Deterministic and independent tests: no ordering dependence, no shared mutable state, fixed or faked
time (`$this->travel(...)`, `Carbon::setTestNow`), explicit setup, no real network, clear names that
state the behaviour and the outcome. Do not over-assert unrelated fields.

**Helper collisions.** Backend helpers are global. Before adding one, run
`grep -rn "function <name>" backend/tests` and give it a file-specific prefix (`feedOwnerWithBrand`,
not `ownerWithBrand`). Prefer a file-scoped closure or a dataset over a new global. Constants
declared with `const` in a test file are global too. Do not edit shared helpers while other work
depends on them; add a new one.

## 12. Stack guidance

See [references/stack-guides.md](references/stack-guides.md) for Laravel/Pest, Dashboard and Flutter
patterns taken from the installed tools.

## 13. Workflow (14 steps)

1. **Inspect** the feature, its routes, Actions, policies, docs and the request.
2. **Find rules and boundaries:** business rules, actors, tenant keys, state machines.
3. **Risk assessment:** rank by section 1; note money, security and tenant exposure.
4. **Find existing tests** (`grep` the route, Action and model names in `tests/`) before adding any.
5. **Build or update the coverage matrix** ([references/coverage-matrix.md](references/coverage-matrix.md)).
6. **List missing scenarios** from the matrix; drop duplicates of existing tests.
7. **Write focused tests**, highest risk first, using section 11 for helper names.
8. **Run the targeted tests** (`vendor/bin/pest <file>`, one file at a time first).
9. **Run the quality checks** the area requires (`vendor/bin/pint --test`, lint, typecheck, `melos verify`).
10. **Run the broader suite** when shared code, helpers or fixtures changed (`composer test`).
11. **Review effectiveness** with section 9; fix weak tests.
12. **Evaluate mutation** for high-risk behaviour only where a driver and approval exist; otherwise record "not run".
13. **Document uncovered risks** and limits in the matrix and the report.
14. **Report accurately** with the vocabulary below.

For bug fixes: write the failing regression test first (it must fail on the old code), then fix.

## 14. Reporting vocabulary

Keep these separate in every report; never merge them:

- **Implemented:** tests written (count, files).
- **Executed:** tests run and passed (command, the real result line).
- **Coverage measured:** a number from a driver, or "not measured".
- **Mutation performed:** tool and score, or "not run".
- **Known gaps:** matrix rows still `missing` or `unverified`.
- **Unverified behaviour:** things no test or command proved.

Never write "fully covered" because tests pass.

## Enforcement

"Enforceable" here means reviewable. A reviewer rejects a test change that: adds a global helper without
the grep, asserts only a status where state or a side effect matters, skips the actor or tenant rows
the matrix marks applicable, claims coverage or mutation that was not measured, edits the unrelated
files named in `git status`, or points tests at the development database. Adding a CI check or a
script for any of these is a separate task that needs approval.

## Guardrails

- Never push, run Playwright without the authorisation in `gates.md`, wipe the development database,
  or use `--no-verify`.
- Preserve unrelated uncommitted changes; stage explicit paths only.
- Do not change application behaviour to make a test pass; report product bugs and fix them only as a
  separate, confirmed task with a regression test.
- Keep this file under 500 lines and each reference under 200.
