# Handover: all remaining work

> See also the [audit register](audit-register/00-next-session-start.md) (2026-11-14): findings F-01 to F-11, decisions A to F, the
> slice plan and the next-session start point. Where the two disagree, the register is newer. Next session: implementation only,
> mandatory prerequisites T-01 to T-04 first ([prerequisites](audit-register/10-prerequisites-t01-t04.md)), then S1.

Written 2026-11-13 after local commit `a5114013` (nothing pushed).
**Reconciled 2026-11-14 against the repository at `ff7755c3`** (19 commits ahead of `origin/master`,
nothing pushed): see section 0a for the verified status. Text below that is marked *(2026-11-14)* is a
correction; the rest is the original handover. Goal: finish every open
issue, feature and piece of tech debt across the backend, the dashboard and the three
mobile apps, each with its tests. Every item below was found by reading the repo on that
date (`docs/next-steps/*`, `docs/decisions-required.md`, `docs/mobile-audit-g10-g11/index.md`,
test counts, file sizes), not recalled from memory. Re-verify an item before working it.

## 0. How to work

- **One work package (WP) = one `monorepo-task-executor` run:** audit, implement across every layer, all gates, hygiene cleanup, one local commit.
  Never bundle two WPs in one commit.
- Read first: root `CLAUDE.md`, `backend/CLAUDE.md`, `frontend/web/dashboard/AGENTS.md`,
  `frontend/mobile/CLAUDE.md`, `.claude/skills/monorepo-task-executor/SKILL.md` and
  `references/gates.md`, `docs/decisions-required.md`.
- Backend contract policy: when the dashboard needs something the backend lacks, change
  the backend (with Pest and docs), backward compatible for the mobile apps.
- Never push, change remotes or use `--no-verify`. Commit subject at most 100 characters.
  End commits with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Playwright: `TZ=UTC`, `DB_DATABASE=dorak_test` only (*(2026-11-14)* the permanent policy in
  `decisions-required.md`; the helper refuses any other name; Laravel does not override process env, so
  also pass `DB_HOST=127.0.0.1 DB_PORT=3307 DB_USERNAME=root DB_PASSWORD=<from backend/phpunit.xml>`),
  free ports for both servers (`E2E_APP_PORT`, and since `ff7755c3` `E2E_BACKEND_PORT`; default 3000 and 8000).
  The dev DB `dorak_backend_development_db` must never be wiped. Port 3000 belongs to unrelated
  containers (`ecm-workflow-*`); never stop another project's server. Run it niced with one worker.
  A deny rule blocks reading `.env` files.
- After the hygiene cleanup run `cd frontend/web/dashboard && npx next typegen`.
- Fix only confirmed issues, each with a regression test. Report pre-existing failures;
  fix them only as their own task.
- Baseline at `a5114013`: backend Pest 1816 passed; Pint, `check-conventions.sh` and
  `composer audit` clean. Test files: backend 218, dashboard Vitest 106, Playwright 24
  specs, mobile 141.

## 0a. Verified status (2026-11-14, HEAD `ff7755c3`)

Gates run on this date at HEAD: Pint pass; `composer test` Pest **2425 passed** (10319 assertions);
`composer test:concurrency` 15 passed; migration guard pass (75 migrations; it falls back to `--all`
because `origin/dev` does not exist); dashboard lint, typecheck, build pass; Vitest **121 files, 596 tests**
pass; Playwright **435 passed** (desktop, mobile-390, ultrawide-3440; 363 before WP-3); `check-conventions.sh`
OK. Not run in this check: `composer audit`, `npm audit`, the Dart dependency check, `melos verify`.
Repository counts: backend test files 257, `*Policy.php` files 27, Vitest files 121, Playwright specs 32,
mobile test files 141.

| WP | Status | Evidence |
|---|---|---|
| WP-1 backend tests NS-04..NS-25 | In progress; not re-audited here | `5fe14796`, `abecba54`, `7a8d23f2`, `cd2b9ff9`, `737f1fd8`, `3ae05868`; Pest grew 1816 to 2425 |
| WP-2 dashboard Vitest | Done for the pure logic (floor-plan maths, filters, forms, schemas, query keys) | `62b9abaf`; component tests still need jsdom, which needs owner approval |
| WP-3 dashboard Playwright | Partly done: 32 specs; see "WP-3 gaps" below | `ff7755c3` |
| WP-4 mobile features | Not started | |
| WP-5 mobile tech debt | Not started | |
| WP-6 dashboard "not done" features | Not started | |
| WP-7 backend tech debt | Done, with three open items below | `1caea7df`, `fef8e27a`, `565a686a`..`fa1c1937` |
| WP-8 security | 8a done (generated cross-tenant matrix, `a4d30752`); 8b (audits, route removal) open | |
| WP-9 Q1 and Q2 | Decisions resolved 2026-11-14 (`058087fc`); **code not started** | no `activated_by_id` check on self-activation; no public barber resource |
| WP-10 deferred | Unchanged | |
| WP-11 release readiness | Not started | |

**WP-7 open items (verified by scan, not fixed):**
- 71 of 112 Dashboard actions (`modules/Dashboard/Http/Actions`) have no direct policy call (bookings status,
  cancel and reschedule, hours overrides, affiliations, job postings and applications, stylists, floor plan, brand
  update, branch suspend and reactivate, and others). They rely on scope-filtered lookups that return 404.
  `backend/CLAUDE.md` and `references/gates.md` say a scoped query alone does not satisfy the authorization
  gate, so converting them (or recording an exemption) is a product decision still open.
- Five methods are 41 to 43 lines against "roughly 40": `CreateBookingEloquentResolver::resolve`,
  `ReviewClientHandler::handle`, `ExploreRanker::score`, `RecomputeClientVectorsCommand::processEntity`
  and `::processClient`. No file is over 300 lines.
- `dashboard.php` is now 59 lines (split by middleware group).

**WP-3 gaps (genuine, no E2E exercises them; found by reading spec titles and searching for each feature):**
1. Floor-plan editor on the chairs screen (layout, zones, save); `chairs.spec.ts` covers list and CRUD only.
2. Invitations (invite, accept, reject, terminate) on the stylists screen.
3. Per-brand stylist pricing.
4. Admin branch-oversight dialog, and closure days and special hours (NS-12).
5. Payment gateways and languages on the admin settings screen (NS-20, NS-23).
6. The notifications bell and feed (NS-10); only the preference switch is covered.
7. Rate client (NS-11) and review dispute and moderation actions (NS-05, NS-14); `reviews.spec.ts` is read-only.
8. The eight modules added in `ff7755c3` are smoke specs (heading, one data check, RTL, dark). Their mutations
   are not covered: admin invite and deactivate, client ban and unban, barber approve, reject, activate and ban,
   currency create, retire and rates, commission rule CRUD, content edits, job postings and applications,
   owner brand create.
9. The job-board write UI for the platform admin does not exist yet (proxy allow-list), so there is nothing to test.
The owner `status` page is only reached through the registration and branch specs.

**Open owner decisions (2026-11-14):** convert the remaining Dashboard actions to policies or accept scoped
lookups; allow jsdom and Testing Library for component tests; define what "Batch 2" meant; when to push the 19 local commits.
*(Resolved 2026-11-14, see the [audit register](audit-register/04-decisions-and-open-questions.md): policies are converted, about 15 actions per slice; jsdom and Testing Library are allowed; "Batch 2" stays out of scope until the owner defines it (D-03); pushing happens only on an explicit owner request. WP-10 stays deferred (D-04).)*

## 1. Decisions only the product owner can make (ask, do not decide in code)

*(2026-11-14) Q1 and Q2 below were resolved on 2026-11-14 in `decisions-required.md` (`058087fc`): Q1 no (an admin
deactivation blocks self-reactivation), Q2 no (a separate public resource, old fields kept until both apps ship).
The table is kept for the evidence; WP-9 is unblocked but its code is not written.*

| # | Question | Evidence | Recommended default |
|---|---|---|---|
| Q1 | May a barber an admin deactivated re-enable themselves via `POST /barbers/{barber}/activate`? | `decisions-required.md` line 66 | No: block until an admin reactivates, using `activation_logs.activated_by_id`. |
| Q2 | Should guests see `email`, `phone`, a freelancer's exact `latitude`/`longitude`, `submission_count`, `email_verified_at` in public barber payloads? | line 68; `BarberResource`; contract tests pin `email` (`ApiResponseContractTest.php:507,575`) | No: a separate public resource with name, bio, rating, rounded location. Needs a coordinated mobile release. |

Both unblock WP-9. Record the answer in `decisions-required.md` before coding.

## 2. Work packages, in order

### WP-1 Backend tests for NS-04 to NS-25 (largest debt)

Only an authorization matrix over 43 admin routes plus a few cases exist
(`DashboardAdminBackOfficeTest`, `DashboardAdminOperationsTest`). The phase docs say
"tests skipped by instruction" for each task. Add Pest happy path, validation, rejection
and side-effect coverage for:

- NS-04 admin invite, edit, deactivate (last-active and self guards)
- NS-05 review disputes; NS-14 dashboard dispute
- NS-06 brand lifecycle (reject and resubmit, suspend, locks, feature overrides, history, emails)
- NS-07 clients and bans; NS-08 barbers platform-wide, activation log; NS-30 approval queue
- NS-09 branch oversight filters; NS-10 notifications feed; NS-11 rate client
- NS-12 closure days and special hours; NS-13 owner workspace; NS-15 floor plan save
- NS-16 invitations; NS-17 job postings and applications (backend tests done, commits `b44382b6` and the D11 / admin-permissions commit; the admin UI for these writes is blocked on the dashboard proxy allow-list and needs Playwright); NS-18 per-brand pricing
- NS-19 currencies and exchange rates (the in-use guard is not covered); NS-20 languages
- NS-21 catalog items and tags; NS-22 commission rules and ledger; NS-23 gateways;
  NS-24 payout detail; NS-25 website content, testimonials, onboarding
- Public-read, cross-tenant and token-scope cases not yet pinned.

Acceptance: each endpoint has allowed, rejected (401, 403, 404, 422) and side-effect tests.
Gates: Pest, Pint, `check-conventions.sh`.

### WP-2 Dashboard Vitest for NS-02 to NS-25

The phase docs list "no Vitest yet", for example the floor-plan layout maths (NS-15).
Cover each screen's logic: mappers, schemas, hooks, forms and dialogs, using the shared
primitives in `references/dashboard-shared-primitives.md`. Gates: lint, typecheck, Vitest, build.

### WP-3 Dashboard Playwright E2E per feature

The phase docs state "per-feature happy paths ... Playwright specs are still open". Write
one spec per module (admin users, brands, clients, barbers, notifications, schedule
overrides, owner workspace, floor plan, invitations, jobs, pricing, currencies, languages,
catalog, commission, gateways, payouts, website content), plus RTL and light/dark checks.
Run the full suite on an isolated DB. Gates: full Playwright pass.

### WP-4 Mobile: open features

- NS-30 barber resubmit screen in `stylist_app` (rejection reason and resubmission cap).
- Notification deep links for invites and applications must open `/affiliations` and
  `/jobs/:id/applicants`, not `/operations` or `/home`.
- Re-audit the mobile apps against the `admin_api` routes the dashboard replaced
  (Activation, Audit, Brand features), which unblocks WP-8.
- Add tests for each of these. Gate: `cd frontend/mobile && dart run melos run verify`.

### WP-5 Mobile: tech debt (from `docs/mobile-audit-g10-g11/index.md`)

- Split files with several top-level classes: `branch_operations.state.dart`,
  `manual_barber.event.dart`, `stylist_schedule.state.dart`.
- Replace repeated string literals (statuses, locale codes, error codes) with enums or
  constants, and raw spacing literals with `DorakDimensions`.
- Replace unchecked `results[n] as X` casts in load blocs. `BookingStatus` must not throw on an
  unknown value (fallback plus a test).
- Remove unused ARB keys: `businessJobFieldRequired` and seven `stylist*` keys (EN and AR parity).
- Files over 300 lines (hand-written only): `client_app/.../app.router.dart` (826),
  `branch_detail.bloc.dart` (396), `operations.repository.dart` (340), `discovery_feed.widget.dart`
  (320), `discovery.bloc.dart` (310), `profile.screen.dart` (308).
- Refresh stale docs: both apps' `docs/feature-index.md`, and the historical parts of
  `agents-part-2.md` and `claude-part-2.md`.

### WP-6 Dashboard: unfinished features recorded as "Not done"

- NS-10: a full notifications page with paging (the bell shows the latest 20).
- NS-09: paging inside the oversight dialog; NS-07 paging of bookings and reviews (latest 20 only).
- NS-08: a reason prompt on deactivation; ending a barber's affiliation from the dashboard.
- NS-12: date ranges and recurring closures; NS-13: logo upload and universe on brand create.
- NS-15: draggable zones; set a chair's zone from the editor.
- NS-16/NS-17: manual control for the "seen" application state.
- NS-21: catalog media upload (needs a multipart path through the proxy), plus the
  attributes the phase file lists as not done. NS-25: onboarding image upload, create and
  delete of pages and sections, an editor friendlier than JSON.
- NS-22: show the ledger's per-entry rule snapshot. NS-23: more drivers when they exist.
- NS-24: an owner endpoint and view for a payout's lines.
- NS-20: `is_active` on languages must actually hide a language where it is offered.
- Each needs backend (Pest), dashboard (Vitest, Playwright) and, when a contract changes, mobile.

### WP-7 Backend tech debt

- `backend/modules/Dashboard/Routes/Api/V1/dashboard.php` is 415 lines. Split it by area
  (only file over the 300-line limit; check `backend/CLAUDE.md` limits).
- Audit the backend for methods over about 40 lines and classes over 300 lines, magic
  strings and numbers, and parameter clumps (the governance rules in `backend/CLAUDE.md`).
- *(2026-11-14) The `backend/CLAUDE.md` correction is done (`fef8e27a`); 27 `*Policy.php` files exist.* Migrating the
  remaining scoped-query-only authorization to policies is still open (see section 0a).
- Remove `admin_api` routes the dashboard replaced once WP-4's mobile re-audit confirms no
  client uses them. Keep `docs/feature-index.md` current.

### WP-8 Security follow-ups

- Tenant isolation was swept 2026-11-13 over all 173 authenticated ID routes by tracing
  ownership markers. It was not a line-by-line read of every handler: add a generated
  cross-tenant Pest test (an actor from owner A against every ID route of owner B) so this
  stays enforced.
- Barber activation (Q1) and public payload fields (Q2) once decided.
- Accepted trade-off to revisit at the next mobile release: Business-app builds before
  `32d66844` no longer clear the unseen application state.
- Re-run `composer audit`, `npm audit` and a Dart dependency check before release.

### WP-9 Implement Q1 and Q2 (after the answers)

Backend change plus Pest, then dashboard and mobile sync, then docs. For Q2, ship a new
public resource, keep the old fields until both mobile apps are released, then remove.

### WP-10 Deferred by decision (do not start until the owner says so; reaffirmed as D-04 on 2026-11-14)

- NS-26 plan self-service and billing (D6: manual billing at launch).
- NS-27 stays closed (D7). Apple and Facebook sign-in are intentionally unsupported (G9);
  do not add them.

### WP-11 Release readiness

Full gates on a clean tree: backend Pest and Pint, `composer audit`; dashboard lint,
typecheck, Vitest, build, full Playwright; `melos verify`; `check-conventions.sh`; docs
index updated (`docs/index.md`, `docs/next-steps/index.md` status column and the
"Done (no tests)" cells, `backend/docs/feature-index.md`).

## 3. Definition of done (per WP)

1. Every acceptance criterion verified with evidence, not assumed.
2. Backend, API contract, docs, dashboard, all three mobile apps and their tests in sync,
   or each unchanged layer named with the reason.
3. All applicable gates pass, Playwright included for dashboard work.
4. Hygiene cleanup, typegen, `git diff --check`, stage only that WP's files, one local commit.
5. Final report: SHA, decisions, per-layer changes, gate table, findings left open.

## 4. Gate commands

- Backend: `cd backend && vendor/bin/pint --test && composer test` (Pest, MySQL `dorak_test`);
  `composer test:concurrency`; `php scripts/check_migrations.php`; `composer audit`.
- Dashboard: `cd frontend/web/dashboard && npm run lint && npm run typecheck && npx vitest run && npm run build`;
  E2E (*2026-11-14*): `TZ=UTC E2E_APP_PORT=<free> E2E_BACKEND_PORT=<free> DB_HOST=127.0.0.1 DB_PORT=3307
  DB_USERNAME=root DB_PASSWORD=<phpunit.xml> DB_DATABASE=dorak_test nice -n 15 npx playwright test`.
- Mobile: `cd frontend/mobile && dart run melos run verify`.
- Repo: `bash .claude/skills/monorepo-task-executor/scripts/check-conventions.sh`.
- Cleanup: `cd frontend/web/dashboard && npm run clean:artifacts`;
  `cd backend && rm -f storage/logs/*.log`;
  `cd frontend/mobile && dart run melos run clean`; then `npx next typegen`.
