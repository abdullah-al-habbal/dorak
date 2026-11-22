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

## Snapshot: 2026-11-22, about 09:00 to 09:15 UTC

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
| Repository | GitHub `abdullah-al-habbal/dorak`, branch `master` | Vercel builds `master`; no GitHub workflow deploys the dashboard. Hostinger is deployed only by the **manual** `deploy.yml` workflow (`workflow_dispatch`; see [CI/CD setup](ci-cd-setup.md)), so a push alone never updates the backend. |

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
| `PUBLIC_SITE_URL` | Vercel | **Not set at this snapshot.** Set it to `https://dorak-bay.vercel.app` (no trailing slash). Needed for canonical and social URLs, a non-empty `sitemap.xml` and the `Sitemap:` line of `robots.txt`. Changing it needs a redeploy. |
| `BOOKING_APP_URL` | Vercel | **Not set (unknown).** There is no store link yet; pages say booking is in the app. See backlog BD-13. |
| Sitemap limits | backend `PublicProfileConstants::EXPLORE_SITEMAP_MAX_PER_KIND` | 10,000 per kind (brands, branches, stylists). |

## Known state and risks at this snapshot

- **The backend does not deploy on push.** Dispatch `deploy.yml` from GitHub Actions (input `reset_database`, default false) after each push that changes the backend. The dashboard's `sitemap.xml` reads the backend feed, so the backend must be deployed first. Until then the sitemap is empty (never wrong).
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

1. Dispatch the `deploy.yml` workflow on `master` (`ee534091e` or later; set `reset_database=true` only if a `migrate:fresh --seed` is wanted on dev, which also re-seeds the default admin). Expect the sitemap feed to answer `200`.
2. Set `PUBLIC_SITE_URL` (and `BOOKING_APP_URL` once an app link exists) on Vercel, then redeploy.
3. Re-run the probes above and update the snapshot table with the new date and results.
4. Run the full Playwright suite when the owner allows wiping `dorak_test` (backlog BD-9, RR-1).
