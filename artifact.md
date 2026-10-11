Read-only audit · no code changed

# Dorak Monorepo Audit

2026-10-11Branch `master` @ `8aa4f607`3,035 tracked files · 449 Markdown filesScope: backend, frontend/dashboard, frontend/mobile, docs, agent config

### Verdict

The code is healthier than the plumbing around it. All three test suites that ran are green, and the dashboard and mobile analyzers report zero errors. The serious problems are elsewhere: CI never runs, generated Flutter caches are committed, the hooks don't install on a fresh clone, backend PHPStan fails, and the docs have three competing entry points. Fix the repo foundations and the docs drift **before** starting the Documentation Graph work. Otherwise the graph will encode stale paths and claims.

## Health by project

Backend

backend/ · Laravel 13 · PHP 8.5

- Tests (Pest, sqlite)584 pass / 0 fail
- PHPStan (max)250 new errors
- Baseline suppressed1,314 errors
- Pint --test1 file
- Modules27 (3 untested)
- CInever runs

Dashboard

frontend/dashboard/ · Next 16 · React 19

- Vitest131 pass / 0 fail
- tsc --noEmit0 errors
- ESLint0 err · 1 warn
- architecture:checkfails
- Test files : source38 : 264
- Open security tasks10, 11, 73

Mobile

frontend/mobile/ · Flutter 3.44 · Bloc + go_router

- flutter analyze0 / 0 / 0
- Testsnot run (see note)
- client_appfeature-rich
- business / stylistshells, no auth
- Build caches tracked46 files
- Empty docs146 of 198

Docs & agent config

docs/ · AGENTS.md · CLAUDE.md · skills

- Markdown links5 broken / 364
- Backtick paths unresolved≤ 490 / 1,423
- Competing root docs3
- Tasks done4 / 87
- Open decisions58
- Agent entry files11 AGENTS/CLAUDE pairs

## Critical and high findings

| Sev | Area | Finding | Evidence | Fix |
| --- | --- | --- | --- | --- |
| Critical | repo | CI and deploy workflows never run. They sit in `backend/.github/`, but GitHub only reads the root `.github/`. They trigger on `dev`/`main`, while the branch is `master`. There is also no git remote. | `backend/.github/workflows/backend-ci.yml`, `deploy.yml` | Move to root `.github/workflows` with `working-directory: backend` and path filters. Fix the branch names. |
| Critical | mobile | Flutter `build/` (9 files) and `.dart_tool/` (37 files) are committed. Any `flutter test` or `pub get` dirties the tree. | commit `ac080f99`. Root `.gitignore` has no Flutter rules. | Add ignore rules, then `git rm -r --cached` both. |
| High | backend | Task 02 is incomplete. Rebook creates a `Confirmed` booking directly. It has no overlap, ban, schedule or locking checks, even though the commit claims "rebook availability". | `ClientHistory/…/RebookFromHistoryEloquentResolver.php:23-30` | Send rebook through the booking create handler (also Task 19). |
| High | backend | Mobile auth routes have no rate limit: client login, register, forgot/reset password, social and refresh, plus barber and branch login. Only the dashboard login is throttled. | `bootstrap/app.php` has no `throttleApi()` | Add named limiters, for example `throttle:5,1`. |
| High | backend | PHPStan fails with 250 errors that are not in the baseline (Dashboard 153, Booking 52). The `composer analyse` script that the docs reference does not exist. | `phpstan.neon`, `phpstan-baseline.neon` | Fix or re-baseline, add the script, and gate it in CI. |
| High | repo | Hooks are not reproducible. `.husky/_` is untracked and nothing runs `prepare`. Every commit pays the dashboard typecheck. Backend and docs get no checks. `backend/.husky/pre-push` is dead, and `backend/package.json` `prepare: husky` can hijack `core.hooksPath`. | `.husky/pre-commit`, `backend/.husky/pre-push` | Root `package.json` with `prepare`. Add a backend pre-push at the root (`pint --test` + tests). Remove the backend husky. |
| High | dashboard | The BFF proxies allowlist paths but not HTTP methods, so any verb passes (Task 11 is open). | `dashboard-path.util.ts:7-29`, `api/barber/[...path]/route.ts` | Explicit `{method, pattern}` tables. |
| High | dashboard | No client-side token refresh. A user who stays on one page is logged out when the 8h token expires (Task 73 is open). | `services/api/client.ts:69` | Single-flight refresh and retry on 401. |
| High | dashboard | Session hardening is not done. The JWT uses one secret, with no `kid`/`jti` and no rotation (Task 10 is open). | `auth/jwt.util.ts:115-160` | Key set by `kid`, and revoke tokens on logout. |
| High | mobile | Release builds can't reach the network: `INTERNET` is declared only in the debug manifest. iOS has no camera, photo or location usage strings, so `image_picker` and `geolocator` crash. | `android/app/src/main/AndroidManifest.xml`, `Info.plist` | Add the permission and the usage strings. |
| High | mobile | `Firebase.initializeApp()` runs unguarded before login, with no Firebase config files, and the platform is hardcoded to `'android'`. | `core/…/push_notification.client.dart:15-25` | Guard it, run it after auth, and detect the platform. |
| High | mobile | `state.extra! as BookingDto` crashes on deep link or app restore (Task 78). | `app.router.dart:517,524` | Load the booking by ID. |
| High | mobile | business_app and stylist_app have no go_router, login, session or `BlocProvider`. Nothing writes a token, so API calls go out unauthenticated (Tasks 82 and 84). | `stylist_app/lib/main.dart:19-47`, `business_app/lib/app.dart:22-50` | Build the shells inside Bloc + go_router. |
| High | docs | Three docs each claim to be the entry point: `index.md`, `docs/actionable-plan.md` and `docs/todowork.md`. `REMEDIATION_PLAN.md` contradicts Task 04: it lets branch actors mutate the catalog, but the catalog is admin-only. | `actionable-plan.md:3-9`, `REMEDIATION_PLAN.md:20-24` | Make `todowork.md` the root and archive the rest (Task 87). |
| High | docs | The task-executor skill gates on `frontend/dashboard/new/`, which doesn't exist. `backend/AGENTS.md` says Flutter moved to `~/dorak-frontend` (24 references across 5 files). | `.agents/skills/monorepo-task-executor/SKILL.md:24`, `backend/AGENTS.md:48` | Fix the paths. Version the skill, because `.agents/` is gitignored. |
| High | docs | 146 of the 198 mobile `docs/` files are 0 bytes. Mobile `AGENTS.md` calls business and stylist "counter stubs" and says profile completion, reviews and favorites are unbuilt. All of these exist. | `frontend/mobile/AGENTS.md:35,394,400` | Delete the empty docs and rewrite the stale sections. |

## Detail by project

Backend 27 modules · 93 test files · Medium/Low items

- Med Task 01 gaps: affiliations created by an admin in Filament get a null initiator, so the barber can never respond. The branch accept paths skip the "one accepted affiliation" invariant (`Branch/…/AcceptAffiliationAction.php:21-33`).
- Med Branch list actions pass an unbounded `per_page` to `paginate()` (5 actions). Cap it at 100.
- Med The Branch module skips the FormRequest → Handler → Resource pattern: inline `validate()`, raw models returned.
- Med Test DB contradiction: `phpunit.xml` forces sqlite, while CI, `.env.testing` and docs say MySQL.
- Med README and `AGENTS.md` are stale: old repo clone URL, "future" modules, a non-existent `composer analyze`, a dead pre-push gate.
- Low Language, Preference and Website have zero tests. Three unrouted actions are dead code. The `phpunit.xml` coverage source points at a missing `app/`.
- Low `.env.example` holds a real-looking `APP_KEY`; blank it. `shouldBeStrict()` is not enabled outside production. There are 9 stray `{Models,Database…` brace-expansion directories (untracked).
- OK No secrets are tracked or in history. Tasks 03 and 04 look complete. There are 0 TODO/FIXME comments.

Dashboard Next 16 BFF · Medium/Low items

- Med The realtime auth route bypasses `backendRequest`: no timeout, a hardcoded localhost fallback, and the Pusher form body is forwarded without `Content-Type` (likely a functional bug). It is also why `architecture:check` fails.
- Med The proxies don't check the claim or actor (only lookups does). There are no security headers (CSP, HSTS, frame-ancestors) in `next.config.ts`.
- Med No tests for `proxy.ts`, `cookies.ts`, the auth routes, or any component. `architecture:check` is not in pre-commit.
- Med `AGENTS.md` describes FullCalendar and Recharts, which are not installed. `frontend-auth-contract.md` lists retired `/profile` routes. `EXECUTION_PLAN.md` marks unproven phases done.
- Low `BACKEND_API_URL` silently falls back to localhost in production. Echo has `forceTLS:false` hardcoded. The `NEXT_PUBLIC_REVERB_*` vars are missing from `.env.example`. There are 8 unused exports. `entity-crud-form.tsx` is 474 lines.
- OK Cookies are httpOnly, sameSite=lax and secure in production. The callback URL is validated. No secrets are tracked. All generated artifacts are git-ignored.

Mobile 3 apps · 4 packages · Medium/Low items

| Unit | Dart files | Lib lines | Blocs | Tests (files / cases) | Maturity |
| --- | --- | --- | --- | --- | --- |
| client_app | 136 | 12.7k | 17 | 29 / 171 | Feature-rich |
| business_app | 10 | 600 | 2 | 2 / 3 | Shell |
| stylist_app | 3 | 314 | 1 | 1 / 1 | Shell |
| core | 153 | 4.7k | 2 | 23 / 131 | Mature |
| design_system | 20 | 1.2k | 0 | 6 / 14 | 14 widgets |
| localization | 4 | 3.9k gen | 0 | 1 / 1 | 299 keys, EN = AR |
| feature_floor_plan | 1 | 1 | 0 | 1 / 1 | Empty stub |

- Med Unwired work from Tasks 80, 81, 85 and 86: `HomeScreen` is unreferenced, `ManualBarberScreen` is unreachable, `RecoveryRestarted` is never dispatched, `deleteAccount` has no caller, there is no logout UI, and the two endpoint barrels diverge.
- Med Business operations render a raw `DateTime` and status strings that bypass l10n. Root-scoped "Blocs" are really Cubits, which breaks the route-scoped rule.
- Med `pusher_channels_flutter` is declared in `core` but never imported.
- Low The root SDK constraint is `>=3.5.0` while members use `^3.12.2`. Release builds sign with the debug key. 4 package READMEs are `flutter create` templates. `CLAUDE.md:90-94` uses bare `mobile/` paths.
- OK All 7 members use `resolution: workspace`. Only `core` creates a Dio instance. There are 0 hardcoded `Text` literals, 0 TODO comments, and no dependency version drift.

Docs & agent config 449 .md files · Medium/Low items

- Med `.aiignore` excludes all of `backend/`, while `index.md`, the task specs and the executor skill send agents there.
- Med The specs carry no status field. The acceptance-criteria boxes in tasks 01–04 are still unticked, although `todowork.md` ticks the tasks. The decision in `decisions-required.md` that Task 01 already implemented is still open.
- Med `docs/FRONTEND_ARCHITECTURE.md` (a "mandatory contract") prescribes `middleware.ts` and `src/shared/`. The real code uses `src/proxy.ts` and has no `src/shared/`.
- Med There are two diverged copies of the stitch-flutter-converter skill, in `.claude/` and `.agents/`, and both are gitignored.
- Low 5 broken links: 3× mobile `feature-index.md`, `BE-03-explore-api.md` → `dorak-frontend`, `qa-plan/SKILL.md` → `PRD.md`.
- Low The empty root `skills/` directory is untracked. Paths in docs have no convention for what they are relative to (`modules/…` vs `backend/modules/…`).

## Documentation Graph proposal: assessment

The pasted directive asks for YAML routing headers (`node_id`, `parent_node`, `child_nodes`, `code_anchors`) on every core doc, with `todowork.md` as the root. The goal is right. As written, the method would mostly encode the drift found above.

### Sound

- One root router fixes the three-root confusion.
- `todowork.md` is the right root. It is the only plan that the commits keep in sync.
- The keys don't collide with existing frontmatter (28 files, all `name`/`description` or design tokens).

### Risky

- The directive assumes `mobile/`. The real path is `frontend/mobile/`.
- Two-sided edges (`parent` + `children`) kept by hand will drift, and nothing enforces them.
- Without a path convention, `code_anchors` would add hundreds of stale anchors straight away. Up to 490 backtick paths already fail to resolve.
- "Verify links" checks the 364 Markdown links, which are 99% clean. It misses the real rot: stale paths and false claims.
- Frontmatter on SKILL.md files can break skill loaders.
- `git add docs/ README.md` would miss the root `index.md`, and there is no root README.

### Recommended scoped version

1. Consolidate first, as part of Task 87. Make `todowork.md` the root. Turn `actionable-plan.md` into a pointer to it. Archive `REMEDIATION_PLAN`, `mvp-gap-analysis` and `DASHBOARD_IMPLEMENTATION_PLAN`. Fix `FRONTEND_ARCHITECTURE.md` and `index.md`.
2. Fix the stale High-severity paths and claims (executor skill, backend and mobile `AGENTS.md`).
3. Put headers on about 15 core nodes only: `index.md`, `docs/*.md`, the 3 top-level `AGENTS.md` files and `EXECUTION_PLAN.md`. Each header gets a one-way `parent` and repo-root-relative `code_anchors`. Skip SKILL.md files and mobile sub-docs.
4. Generate `docs/INDEX.md` from the headers. Derive child lists; never maintain them by hand.
5. Add a `check-docs` script that validates links, header schema and anchor existence (with a `planned:` escape), and run it in a root pre-commit step on staged `*.md` files.

## Suggested order of work

1. **Repo foundations:** untrack the Flutter caches, move CI to the root, make the hooks reproducible, add a backend gate.
2. **Security quick wins:** auth rate limits, rebook through the booking engine, BFF method allowlist (Task 11), token refresh (Task 73).
3. **Mobile release blockers:** manifest and plist permissions, Firebase guard, the `state.extra!` crash.
4. **Static analysis:** clear or re-baseline PHPStan, fix `architecture:check`, wire both into CI.
5. **Docs consolidation (Task 87), then the scoped Documentation Graph.**
6. Continue the task tracker (05 → 87).

### Side effect during the scan: needs your decision

The mobile scan ran `flutter test` in `packages/core`. Because `.dart_tool/` is committed (the Critical finding above), the run rewrote 6 tracked cache files. No source code changed. I left them as they are. To discard the changes, run:

```
git checkout -- frontend/mobile/.dart_tool
```

Method: four parallel read-only scans (backend, dashboard, mobile, docs/config) plus repo-level checks. Spot-verified: committed Flutter caches, no root `.github`, the rebook resolver, and route throttles. Counts of unresolved backtick paths are upper bounds, because they include files that tasks plan to create.