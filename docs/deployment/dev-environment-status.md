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
