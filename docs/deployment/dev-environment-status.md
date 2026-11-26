---
nodeid: docs.deployment.dev-environment-status
parentnode: docs.deployment
childnodes: []
codeanchors:
  - scripts/verify-deploy.sh
  - frontend/web/dashboard/src/app/sitemap.ts
  - frontend/web/dashboard/src/app/robots.ts
  - backend/modules/Explore/Routes/Api/V1/public-profiles.php
---

# Dev environment status (dated snapshot)

Part of the [Dorak Deployment and Handover Guide](deployment-guide.md). This page is a **dated record** of what was observed on the live dev environment, so a person or an AI agent can tell what was true and when. It is not a spec: when a fact here and a live probe disagree, the probe wins, and this page should be re-dated. Stable setup lives in [Vercel dashboard hosting](vercel-dashboard.md) and [Hostinger answers](hostinger-questions.md).

No secret appears on this page, and none must be added (no tokens, claims, `.env` values or session secrets).

## Snapshot 11: 2026-11-26, about 13:49 UTC, BG-46 and BG-47 pushed, not deployed

`master` was pushed up to `35cdba0d4` (`9775e23e1..35cdba0d4`: `f30964ca7` BG-46 and `35cdba0d4` BG-47). No deploy was dispatched. The last deploy run is still [`45277277114`](https://github.com/abdullah-al-habbal/dorak/actions/runs/45277277114) (`fea9c09fd`).

| Item | Value |
|---|---|
| Backend CI | [`45832755946`](https://github.com/abdullah-al-habbal/dorak/actions/runs/45832755946): success (3004 tests passed, then 12 more in a second Pest step) |
| Mobile CI | [`45832755927`](https://github.com/abdullah-al-habbal/dorak/actions/runs/45832755927): success (melos analyze, taxonomy and test; APK and web builds skipped) |
| Local gates for BG-47 | Pest 3004 passed (13525 assertions); Pint on touched files and `scripts/check-conventions.sh` passed; Playwright skipped on request |
| Waiting for a deploy | backend code of `aa144ecbe`, `4897540c0`, `7f0aca277`, `f30964ca7`, `35cdba0d4`. No migration changed since `fea9c09fd`, so use `reset_database=false` |
| `scripts/verify-deploy.sh` (read-only, old backend) | all probes passed; health reports every check `ok`, which does not show that a queue worker runs (RR-8) |
| Reverb on dev | a WebSocket upgrade to `https://dev-dorak-backend.io/app/<dummy key>` answered a PHP `404`. No Reverb server answers on the host and path the mobile `.env.example` files use (RR-20). The server `.env` was not read |
| Live realtime checks (BG-43, BG-44, BG-46, BG-47) | not run |

## Snapshot 10 (superseded by snapshot 11): 2026-11-26, push Phase 2 code complete, written before the push to `origin/master`

The owner asked on 2026-11-26 to push `master`. At the time of writing nothing had been pushed since `6ab921c87`; the live dev environment was not probed for this snapshot, so the "live on dev" facts of snapshot 9 are carried over, not re-observed.

| Item | Value |
|---|---|
| Waiting to be pushed | `aa144ecbe`, `4897540c0`, `c24afed57`, `36b5bb2dc`, `f2d66230f`, `350f4f937` and the commit that adds this snapshot |
| Backend release | not done. `.github/workflows/deploy.yml` runs only by manual dispatch. No migration changed in Phase 2, so use `reset_database=false` |
| Dashboard | Vercel builds pushed commits ([Vercel hosting](vercel-dashboard.md)), so the push can publish the dashboard before the backend push routes exist on dev. With the `NEXT_PUBLIC_FIREBASE_*` variables unset the browser-push row stays hidden and calls nothing |
| Gates, 2026-11-26 | dashboard lint, typecheck, 1243 Vitest tests and build passed; mobile `melos run verify` passed; Playwright skipped on request |
| Still not verified | real push delivery (RR-16, RR-19) |

## Snapshot 9 (superseded by snapshot 10): 2026-11-25, 12:52 UTC (15:52 +03), local push Phase 2 work, not deployed

**What is live on dev:** backend code of `fea9c09fd` (deploy run [`45277277114`](https://github.com/abdullah-al-habbal/dorak/actions/runs/45277277114), 2026-11-23, `reset_database=true`, success) and the Vercel deployment of the same commit; `origin/master` is at `6ab921c87` (docs only after that). Nothing was pushed or deployed since.

**What is local only:** `master` is 2 commits ahead of `origin/master`: `aa144ecbe` (Push P2.1, dashboard push-token API) and `4897540c0` (Push P2.2, browser tokens survive a password change made from the dashboard). The dashboard browser-push slice is uncommitted and blocked on the `firebase` npm dependency (BD-14). **No migration changed in Phase 2**, so the next release uses `reset_database=false`: `scripts/release-dev.sh`, then `scripts/verify-deploy.sh`, only when the owner asks.

| Item | Value |
|---|---|
| Backend Pest, whole suite, sequential, at `4897540c0` | 2974 passed (13449 assertions) |
| Pint, `scripts/check_migrations.php` (no migration changed), `scripts/check-conventions.sh`, `git diff --check` | passed |
| Dashboard gates | typecheck fails only on the missing `firebase` imports; build not run; Playwright skipped on request |
| Real push delivery, browser or phone | not verified: no Firebase project, web config or VAPID key yet (RR-16, RR-19) |
| Environment URLs | unchanged: backend `https://dev-dorak-backend.io` (health `https://dev-dorak-backend.io/api/v1/health`), dashboard `https://dorak-bay.vercel.app`, repository `https://github.com/abdullah-al-habbal/dorak` |
| Vercel variables Phase 2 will need (names only) | `NEXT_PUBLIC_FIREBASE_API_KEY`, `_PROJECT_ID`, `_MESSAGING_SENDER_ID`, `_APP_ID`, `_VAPID_KEY`; not set |
| Backend variables push needs (names only) | `FCM_PROJECT_ID`, `FCM_CREDENTIALS`; not set on dev |

State, contract and open points: [push notifications](../architecture/push-notifications.md) sections 1 and 8; handover: [handover-push-phase-2](../sessions/handover-push-phase-2.md).

## Snapshot 8 (superseded, see the second "Snapshot 8" below for the release): 2026-11-23, 21:55 UTC (2026-11-24 00:55 +03), local push-notification work, not deployed

Nothing was pushed or deployed; the live dev environment is still snapshot 7 (`966e094a7`). Local `master` is three feature commits ahead (`46e1d3f39`, `f7e208176`, `1ab76c269`) plus the documentation commit that records them. The dev database **must be rebuilt** (`scripts/release-dev.sh --reset-database`, authorised by the owner on 2026-11-23, not yet run) when this is released, because the `device_tokens` create migration was edited in place; see [push notifications](../architecture/push-notifications.md).

| Item | Value |
|---|---|
| Backend Pest, whole suite, sequential | 2964 passed (13397 assertions) |
| Pint, `scripts/check_migrations.php` | passed (the edited migration carries a `@contract-migration` waiver) |
| `php artisan migrate:fresh --seed` on the local database | ran |
| Mobile `dart run melos run verify` | passed |
| `scripts/check-conventions.sh`, `git diff --check` | passed |
| Dashboard gates and Playwright | not run (no dashboard file changed; Playwright skipped on request) |
| Android flavor build | not verified (local NDK is malformed, RR-18) |
| Real push delivery | not verified (no Firebase project or config yet, RR-16) |
| Environment URLs | unchanged: backend `https://dev-dorak-backend.io`, dashboard `https://dorak-bay.vercel.app`, repository `https://github.com/abdullah-al-habbal/dorak` |
| Mobile CI | now builds the `dev` flavor and uploads `app-dev-release.apk` (changed in P1.3, not yet run on GitHub) |

## Snapshot 7: 2026-11-23, 21:16 UTC (after the terminology and settings-route release, no database reset)

Release by `scripts/release-dev.sh` from `master` at `966e094a7` (the five local commits of snapshot 6 plus the docs commit, pushed together: `f2d768a0d..966e094a7`). Backend deploy: workflow `deploy.yml` run [`45267891146`](https://github.com/abdullah-al-habbal/dorak/actions/runs/45267891146), `reset_database=false`, conclusion **success** (21:15:59 to 21:16:26 UTC). Vercel status of `966e094a7`: `success`. Playwright was not run. This closes RR-15.

`scripts/verify-deploy.sh` passed all 9 probes (health 200 and ok with no debug details, dashboard login with bad credentials 401, CORS preflight 204 with the allow-origin header, `/api/auth/me` without a session 401, Arabic empty-body validation on `/dashboard/login` 422 in Arabic).

Extra read-only probes (empty JSON bodies, so validation fails before anything is written; no credentials used, no data created):

| Probe | Result |
|---|---|
| `POST /api/v1/dashboard/login`, `{}` | `422`; `Accept-Language: ar` gives "الحقل actor type مطلوب."; `en` gives "The actor type field is required." (`actor_type` is on the deliberate technical-field list: the dashboard always sends it) |
| `POST /api/v1/dashboard/password/forgot`, `{}` | same `422` pair |
| `POST /api/v1/dashboard/owner/register`, `{}` | `422`; Arabic "الحقل اسم المالك مطلوب." and English "The owner.name field is required." |
| `PATCH /api/v1/dashboard/settings` without a session | `401` |
| `GET /api/v1/public/sitemap` | `200` |

Not probed live: the stored-language fallback on the signed-in `PATCH /settings` routes, because it needs a signed-in session and the seeded credentials are not used for probes here. It is covered by `StoredLocaleWriteRoutesTest` (backend gate: 2954 tests passed before the release).

## Snapshot 6: 2026-11-23, 21:09 UTC (2026-11-24 00:09 +03), local work before the release (released in snapshot 7)

Nothing was deployed at this point (snapshot 7 is the release). This snapshot records the repository state after the terminology and test-hardening work, so the next person can tell what is live (snapshot 5, `1f39ce675`) from what is only local.

| Item | Value |
|---|---|
| `origin/master` | `f2d768a0d` (docs only on top of the released `1f39ce675`) |
| Local `master` | `daf476c02`, four commits ahead, **not pushed** |
| Dev environment | still serves snapshot 5 (old Arabic strings, no language middleware on the settings routes) |
| Backlog item | RR-15 (release these commits) |

Local commits, oldest first:

| Commit | Change |
|---|---|
| `dc35a1076` | duplicate `discoveryTitle` and `discoverySubtitle` ARB keys removed; the mobile localization test counts raw top-level keys |
| `1a4116f41` | user-facing Arabic says المصفف / المصففون instead of الحلاق in backend `Lang/ar`, dashboard `locales/ar` and `app_ar.arb`; guards in Pest, Vitest and the mobile localization test; standard in [localization of machine keys](../architecture/localization-of-machine-keys.md) |
| `8b9be4627` | the dashboard, client, barber and branch `settings` routes use `ApplyPreferredLocaleMiddleware`; `StoredLocaleWriteRoutesTest` (C1) and tighter C4 guard tests |
| `daf476c02` | the D5 deploy item is RR-15 (snapshot 3 keeps RR-14 for the sitemap) |

Gate results on this tree (all run locally on 2026-11-23; no Playwright, by the owner's instruction):

| Gate | Result |
|---|---|
| Backend Pest, whole suite, sequential | 2954 passed |
| Pint, `scripts/check_migrations.php` | passed (no migration changed) |
| Dashboard Vitest | 221 files, 1208 tests passed |
| Dashboard lint, typecheck, build | passed |
| Mobile `dart run melos run verify` | passed |
| `scripts/check-conventions.sh`, `git diff --check` | passed |

Local configuration these results depend on (no secret values):

| Setting | Value |
|---|---|
| Test database | MySQL 8.4 container `dorak-test-db-mysql-1` from `backend/docker-compose.test.yml`, `127.0.0.1:3307`, database `dorak_test`; start with `composer test:db:up`, stop with `composer test:db:down`; left running after this work |
| Pest | sequential only; `--parallel` is refused by the test guard |
| Environment URLs | unchanged, see snapshot 1 (backend `https://dev-dorak-backend.io`, dashboard `https://dorak-bay.vercel.app`) |
| Release path | `scripts/release-dev.sh` (`reset_database=false`), then `scripts/verify-deploy.sh` |

## Snapshot 5: 2026-11-23 (after the Arabic-validation and enum-drift release, no database reset)

Release by `scripts/release-dev.sh` from `master` at `1f39ce675` (25 commits pushed: the A1 to E chain plus the terminology, affiliation-label and `melos generate` fixes). Backend deploy: workflow `deploy.yml` run [`45243219197`](https://github.com/abdullah-al-habbal/dorak/actions/runs/45243219197) with `reset_database=false`; Vercel deployment for the same commit: success. Playwright was not run.

`scripts/verify-deploy.sh` passed all 9 probes, including the new one: `POST /api/v1/dashboard/login` with an empty body and `Accept-Language: ar` answers `422` with an Arabic validation message. This confirms that the language middleware on the public dashboard routes is live on dev (the item tracked as RR-15, "D5 needs a deploy", before this release; backlog commit `a5cd410d4` first filed it under the ID RR-14, which snapshot 3 had already used for the sitemap, so it is RR-15 here and in the history).

## Snapshot 4: 2026-11-23 (after the TD-18 release, database reset)

Release by `scripts/release-dev.sh --reset-database` from `master` at `b31a11bbc` (TD-3, T1 to T3 badge and enum fallbacks, Arabic validation messages, bilingual catalog tag groups). Backend deploy: workflow `deploy.yml` run [`45163821087`](https://github.com/abdullah-al-habbal/dorak/actions/runs/45163821087), dispatched with `reset_database=true` on purpose: the create migration of `service_catalog_item_tags` was edited (TD-18, waived in the migration guard), so the dev database was dropped and re-seeded. Conclusion **success**. Vercel status of `b31a11bbc`: `success`. `scripts/verify-deploy.sh` passed all 7 checks.

Because of the reset, the dev data created by hand before this release is gone, and the seeded admin (RR-13) was re-created. Playwright has not run against these commits.

| Probe | Result |
|---|---|
| `GET /api/v1/public/sitemap` (backend) | `200`; `brands` 2, `branches` 2, `stylists` 1 (the seeded data) |
| `GET /sitemap.xml`, `GET /robots.txt` (Vercel) | `200` each |

## Snapshot 3: 2026-11-23, about 10:28 UTC (after the localization release)

Release by `scripts/release-dev.sh` from `master` at `15eed1b1b` (the LOC-1 to LOC-6 and TD-15 localization work, 12 commits pushed). Backend deploy: workflow `deploy.yml` run [`45155362569`](https://github.com/abdullah-al-habbal/dorak/actions/runs/45155362569), dispatched with `reset_database=false`, conclusion **success**. The Vercel status of `15eed1b1b` was `success`. `scripts/verify-deploy.sh` passed all 7 checks. No migration changed.

| Probe (10:28 UTC) | Result |
|---|---|
| `GET /robots.txt` (Vercel) | `200`; now **has** the line `Sitemap: https://dorak-bay.vercel.app/sitemap.xml` |
| `GET /sitemap.xml` (Vercel) | `200`, `application/xml`; **5** `<url>` entries: `/brands/dorak-demo`, `/brands/miller-inc`, `/branches/branch`, `/branches/demo-salon`, `/stylists/barber` |
| `GET /api/v1/public/sitemap` (backend) | `200`; `brands` 2, `branches` 2, `stylists` 1 (same slugs) |
| `GET /brands/dorak-demo` (Vercel) | `200` |
| `GET /branches/none-here` (Vercel) | `404` |

This closes RR-14: the new Vercel deployment picked up `PUBLIC_SITE_URL`, so the dashboard sitemap now matches the backend feed. `BOOKING_APP_URL` stays unset (BD-13). Playwright has not run against these commits.

Signed-in check of the localization (the seeded admin, through the dashboard login route, then signed out): `GET /api/auth/me` returned `actor_type` `admin`, `role` `platform_admin`, `branch_id` `null`. The server-rendered `/dashboard/admin` page showed one session row, `Role` / `Platform admin` in English and `الدور` / `مشرف المنصة` in Arabic, with no Permissions row, no `dashboard` badge and no Branch row. After logout `GET /api/auth/me` answered `401`. The admin's notification inbox was empty, so the recipient-language notification text was not observed live (it is covered by `tests/Feature/Core/PlatformNotifierLocaleTest.php`).

## Snapshot 2: 2026-11-22, 09:27 to 09:29 UTC (after the backend deploy)

Backend deploy: GitHub Actions run [`45007603165`](https://github.com/abdullah-al-habbal/dorak/actions/runs/45007603165), workflow `deploy.yml` dispatched by hand on `master` with `reset_database=false`, built from `ee534091e`. Conclusion **success** (job "Deploy to Hostinger" 32 s: set up job, determine seed flag, deploy via SSH, complete job). Dispatched 09:27:03 UTC, finished 09:27:41 UTC. No database reset was requested, so the seeded data were kept.

| Probe (09:28 UTC) | Before the deploy (snapshot 1) | After the deploy |
|---|---|---|
| `GET /api/v1/health` (backend) | `200`, all checks `ok` | `200`, all checks `ok` |
| `GET /api/v1/public/sitemap` (backend) | `404 RESOURCE_NOT_FOUND` | **`200`**: `data` has `brands` (2), `branches` (2), `stylists` (1); each entry is only `slug` and `updated_at`. Slugs: brands `dorak-demo`, `miller-inc`; branches `branch`, `demo-salon`; stylist `barber`. |
| `GET /robots.txt` (Vercel) | `200`, no `Sitemap:` line | `200`, **still no `Sitemap:` line** |
| `GET /sitemap.xml` (Vercel) | `200`, empty `<urlset>` | `200`, **still an empty `<urlset>`** |
| `GET /brands/none-here`, `/branches/none-here` (Vercel) | `404` each | `404` each |
| `GET /brands/dorak-demo`, `/branches/demo-salon`, `/stylists/barber` (Vercel) | not probed | `200` each (the listed slugs are real pages) |

Why the Vercel sitemap is still empty: the owner set `PUBLIC_SITE_URL` in the Vercel project, but Vercel applies an environment variable only to **new** deployments, and none was made after it was set. The backend feed now works, so a redeploy of the Vercel project (not a code change) should fill `sitemap.xml` and add the `Sitemap:` line. Not yet verified: re-check after the redeploy.

## Snapshot 1: 2026-11-22, about 09:00 to 09:15 UTC (before the backend deploy)

Observed from a developer machine with `curl`, after `master` and `origin/master` were both at `ee534091e` (`feat(dashboard): branch tags, sitemap.xml and robots.txt for public profiles (FT-23)`).

### Environments and URLs

| Part | URL or place | Notes |
|---|---|---|
| Backend (Laravel API) | `https://dev-dorak-backend.io` | Hostinger shared hosting, PHP 8.5.13 on the response header, `platform: hostinger`. Origin only, no `/api` suffix when used as `BACKEND_API_URL`. |
| Dashboard (Next.js) | `https://dorak-bay.vercel.app` | Vercel project `dorak`, team `abdullah-allhabals-projects`. The Vercel project page needs a login and was **not** inspected. |
| Admin sign-in page | `https://dorak-bay.vercel.app/dashboard/admin/login` | |
| Health | `https://dev-dorak-backend.io/api/v1/health` | |
| Public sitemap feed (new) | `https://dev-dorak-backend.io/api/v1/public/sitemap` | Added in `6949d9721`. |
| Dashboard `sitemap.xml`, `robots.txt` | `https://dorak-bay.vercel.app/sitemap.xml`, `/robots.txt` | Added in `ee534091e`. |
| Repository | GitHub `abdullah-al-habbal/dorak`, branch `master` | Vercel builds `master`; no GitHub workflow deploys the dashboard. Hostinger is deployed only by the **manual** `deploy.yml` workflow (`workflow_dispatch`; see [CI/CD setup](ci-cd-setup.md)), so a push alone never updates the backend. Run it from a terminal with `gh workflow run deploy.yml --ref master -f reset_database=false` (needs `gh` signed in), then `gh run watch <run-id> --exit-status`. |

### Probe results

| Probe | Result |
|---|---|
| `GET /api/v1/health` on the backend | `200`. `data.status` is `ok`; `app`, `database`, `cache`, `php` and `queue` checks are all `ok`. |
| `GET /api/v1/public/sitemap` on the backend | **`404 RESOURCE_NOT_FOUND`**. The Hostinger deployment does not yet contain `6949d9721` (the deploy workflow is manual and had not been dispatched after the push). |
| `GET /robots.txt` on Vercel | `200`, `text/plain`: `User-Agent: *`, `Allow: /`, `Disallow: /dashboard/`, `Disallow: /api/`. **No `Sitemap:` line**, so `PUBLIC_SITE_URL` is not set on Vercel. |
| `GET /sitemap.xml` on Vercel | `200`, `application/xml`, an **empty** `<urlset>` (expected: no `PUBLIC_SITE_URL`, and the backend feed is missing). |
| `GET /dashboard/admin/login` on Vercel | `200` |
| `GET /brands/none-here`, `/branches/none-here` on Vercel | `404` each (the proxy's real-404 gate for unknown public profile slugs works on the deployment). |
| `POST /api/v1/dashboard/login` (`actor_type` `admin`, the seeded admin) | `200`; the body carries `claim`, `token`, `refresh_token`, `expires_in`, `refresh_expires_in`. |
| `GET /api/v1/dashboard/me` with the bearer token **and** the `X-Dashboard-Session` claim header | `200`: `actor_type` `admin`, `role` `platform_admin`, `display_name` `Admin`, `permissions` `["dashboard"]`. |
| `GET /api/v1/dashboard/me` with the bearer token only | `401`. The claim header is mandatory (see [`/me` contract](vercel-dashboard.md#backend-me-contract)). |
| `POST /api/v1/dashboard/logout`, then `/me` again | logout `200`, then `/me` `401`: the session was revoked. |

Evidence that Vercel auto-deploys `origin/master`: the pushed `ee534091e` added `src/app/sitemap.ts` and `src/app/robots.ts`, and both routes answered on `dorak-bay.vercel.app` minutes after the push.

### Gates behind the code that is deployed

Run on 2026-11-22 before the push, Playwright **skipped by the owner's instruction** for this pass (it has not been run against these commits).

| Gate | Result |
|---|---|
| Backend Pest | 2812 passed (12,026 assertions), including 2 new sitemap tests |
| `pint --test` | passed |
| `php scripts/check_migrations.php` | passed (3 added, 0 modified migrations) |
| PHPStan | not installed |
| Dashboard lint, typecheck | clean |
| Dashboard Vitest | 214 files, 1147 tests passed |
| Dashboard `next build` | passed; `/robots.txt` and `/sitemap.xml` are dynamic routes |
| Mobile `melos verify` | not run (no mobile files changed) |
| Conventions script | `conventions OK` (`.claude/skills/monorepo-task-executor/scripts/check-conventions.sh`) |
| Playwright E2E | **not run** |

## Configuration reference

| Setting | Where | Value or rule |
|---|---|---|
| `BACKEND_API_URL` | Vercel | `https://dev-dorak-backend.io` (origin only). Set and working: the dashboard's server reaches Laravel. |
| `DASHBOARD_SESSION_SECRET` | Vercel and Hostinger `shared/.env` | Must be identical on both; at least 32 characters. Matching is proven by the working login and `/me`. Never print or commit it. |
| `PUBLIC_SITE_URL` | Vercel | **Set by the owner after snapshot 1, but not yet live in a deployment** (snapshot 2 still shows no `Sitemap:` line, so a redeploy is pending). The value must be `https://dorak-bay.vercel.app` (no trailing slash). It is needed for canonical and social URLs, a non-empty `sitemap.xml` and the `Sitemap:` line of `robots.txt`. Changing it needs a redeploy. |
| `BOOKING_APP_URL` | Vercel | **Not set (unknown).** There is no store link yet; pages say booking is in the app. See backlog BD-13. |
| Sitemap limits | backend `PublicProfileConstants::EXPLORE_SITEMAP_MAX_PER_KIND` | 10,000 per kind (brands, branches, stylists). |

## Known state and risks at this snapshot

- **The backend does not deploy on push.** Dispatch `deploy.yml` (input `reset_database`, default false) after each push that changes the backend; this was done at 09:27 UTC (snapshot 2). The dashboard's `sitemap.xml` reads the backend feed, so the backend must be deployed first. Until then the sitemap is empty (never wrong).
- **Seeded admin password is the default.** `admin@dorak.sy` signs in on the public dev backend with the password from `AdminSeeder` (verified again on this date). This is a known, deliberately deferred risk while the environment holds only seed data (backlog RR-10 and RR-13). Rotate it, and `DASHBOARD_SESSION_SECRET`, before any real user or real data.
- **Branch photo, gallery, phone, social links and a web booking flow do not exist** in the schema or API (backlog FT-23). Barber phone numbers are private and must stay off the public API.
- **Two backend reads per public profile view** (proxy 404 gate and the page) stay uncached on purpose (backlog FT-23).

## Re-run these checks

Read-only, no credentials, exit code non-zero on failure:

```bash
scripts/verify-deploy.sh
```

Additional manual probes for the sitemap work (replace the origins if they change):

```bash
curl -si https://dev-dorak-backend.io/api/v1/public/sitemap        # expect 200 and data.brands, data.branches, data.stylists
curl -si https://dorak-bay.vercel.app/robots.txt                   # expect Disallow lines and a Sitemap: line
curl -si https://dorak-bay.vercel.app/sitemap.xml                  # expect <urlset> with <loc> entries
```

The signed-in check (`login`, then `/me` with both headers, then `logout`) is documented in the [`/me` contract](vercel-dashboard.md#backend-me-contract); keep tokens and claims out of logs, files and chat, and delete any temporary file that held them.

## Next owner actions (in order)

1. ~~Dispatch `deploy.yml`~~ Done 2026-11-22 09:27 UTC (run `45007603165`, success, `reset_database=false`).
2. Redeploy the Vercel project so it picks up `PUBLIC_SITE_URL=https://dorak-bay.vercel.app` (Vercel dashboard, Deployments, Redeploy; or push a commit). Then expect `/robots.txt` to end with `Sitemap: https://dorak-bay.vercel.app/sitemap.xml` and `/sitemap.xml` to list five `<loc>` entries (two brands, two branches, one stylist).
3. Push the local documentation commits (`git push`) when ready; code commits `ee534091e` and earlier are already on `origin/master`.
4. Set `BOOKING_APP_URL` once an app store or universal link exists (backlog BD-13).
5. Rotate the seeded admin password and `DASHBOARD_SESSION_SECRET` before any real user (backlog RR-10, RR-13).
6. Run the full Playwright suite when the owner allows wiping `dorak_test` (backlog BD-9, RR-1). It has not run against `ee534091e`.

## Snapshot 8 (2026-11-23): push Phase 1 release

- Pushed `master` up to `fea9c09fd`; dispatched `deploy.yml` with `reset_database=true` (authorised for dev only). Run `45277277114`: success. Vercel deployment for the same commit: success.
- The reset applied the edited `device_tokens` create migration (`locale`, `app_version`, `access_token_id`, `revoked_at`). The dev database holds seed data only again.
- `scripts/verify-deploy.sh`: all probes PASS (health 200, no debug details, dashboard login 401, CORS preflight 204, `/me` without a session 401, Arabic validation message).
- `fea9c09fd` also revokes or erases device tokens on account deletion, password change and reset, bans and deactivation (Push P1.5).
- Not done: Firebase project files and `FCM_PROJECT_ID` / `FCM_CREDENTIALS` (backlog RR-16, RR-19), so no push is sent yet.
