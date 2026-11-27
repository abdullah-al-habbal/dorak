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

# Dev environment status

Part of the [Dorak Deployment and Handover Guide](deployment-guide.md). The **current** state of the dev environment.
Update it in place after a release or probe; don't add snapshots. Each fact has the date it was observed. When a live
probe disagrees, the probe wins. Earlier snapshots are in Git:
`git show 873d3edb9:docs/deployment/dev-environment-status.md`.

No secret appears on this page, and none must be added.

## Deployed

| Item | Value | Observed |
|---|---|---|
| Backend | `7b3814481`, deploy run [`46032475790`](https://github.com/abdullah-al-habbal/dorak/actions/runs/46032475790), no database reset | 2026-11-27 |
| Dashboard | Vercel status `success` for that release, and again for the push of `6aa3d73d0`, which changed no dashboard code (not probed) | 2026-11-27 |
| `scripts/verify-deploy.sh` | all probes passed | 2026-11-27 17:16 UTC |
| Public data | `GET /api/v1/public/sitemap` 200; the dashboard's `robots.txt` had its `Disallow` and `Sitemap` lines and `sitemap.xml` had 5 entries | 2026-11-27 17:16 UTC |
| CI for the deployed commit | Backend [`46031236827`](https://github.com/abdullah-al-habbal/dorak/actions/runs/46031236827) and Mobile [`46031236858`](https://github.com/abdullah-al-habbal/dorak/actions/runs/46031236858): success | 2026-11-27 |
| Latest Dashboard CI | [`45835784334`](https://github.com/abdullah-al-habbal/dorak/actions/runs/45835784334) (`a712aca7f`, manual run): success | 2026-11-26 |
| Last dev database reset | deploy run [`45277277114`](https://github.com/abdullah-al-habbal/dorak/actions/runs/45277277114) (`fea9c09fd`) | 2026-11-23 |

## URLs

| Part | Value |
|---|---|
| Backend (Hostinger) | `https://dev-dorak-backend.io` (origin only); health at `/api/v1/health` |
| API base | `https://dev-dorak-backend.io/api/v1`; private channel authorization at `/broadcasting/auth` under it |
| Dashboard (Vercel, project `dorak`) | `https://dorak-bay.vercel.app`; admin sign-in `/dashboard/admin/login` |
| Repository | `https://github.com/abdullah-al-habbal/dorak`, branch `master` |

## Releasing

- **A push doesn't deploy the backend.** `.github/workflows/deploy.yml` runs only by manual dispatch (input
  `reset_database`, default false). Use `scripts/release-dev.sh`; see [CI/CD setup](ci-cd-setup.md).
- Vercel builds pushed `master` commits (observed 2026-11-22). No GitHub workflow deploys the dashboard.
- Deploy the backend before checking dashboard pages that need new routes.
- Only dev may be reset, and only with the owner's authorisation. Production is never reset.

## Configuration

| Setting | Where | State |
|---|---|---|
| `BACKEND_API_URL` | Vercel | set to the backend origin; working 2026-11-22 |
| `DASHBOARD_SESSION_SECRET` | Vercel and server `.env` | values matched (sign-in worked) 2026-11-22; must be identical, 32 characters or more |
| `PUBLIC_SITE_URL` | Vercel | live in the deployment 2026-11-23: sitemap had entries and `robots.txt` named it |
| `BOOKING_APP_URL` | Vercel | not set as of 2026-11-23 (BD-13) |
| `FCM_PROJECT_ID`, `FCM_CREDENTIALS` | server `.env` | recorded as not set 2026-11-25; not rechecked (RR-16) |
| five `NEXT_PUBLIC_FIREBASE_*` | Vercel | recorded as not set 2026-11-25; not rechecked (RR-16) |
| `REVERB_*`, `BROADCAST_CONNECTION` | server `.env` | not read (RR-20) |
| Reverb `allowed_origins` | tracked `backend/config/reverb.php` | `['*']` in the deployed commit; it must stay so for the apps (BG-51) |

## Not working or not verified

| Area | State | Backlog |
|---|---|---|
| Realtime | a WebSocket upgrade with a dummy key answered 404 (2026-11-27 17:16 UTC): no Reverb server. Delivery was proved only [locally](../waves/runbook.md#local-realtime-reverb-and-a-queue-worker) | RR-20 |
| Queue worker and scheduler | not confirmed; a healthy `/health` doesn't prove a worker runs | RR-8 |
| Push delivery | never verified on a phone or browser | RR-16 |
| Seeded admin password | was still the default on 2026-11-22 on this public server; rotate before real users or data | RR-10, RR-13 |

## Live checks still relied on

Channel authorization, at `a712aca7f` on 2026-11-26 (subscription signing only, no message delivery):

- A branch could sign its own `branch.{id}` and `floor-plan.{id}`. A random other branch, floor plan and client got 403.
- With its brand suspended, the branch got 403 on both; the stylist kept their own `barber.{id}`.
- After reactivation both signed again.
- Not covered: channels involving a seated stylist, and the owner channel.

## Re-run the checks

Read-only, no credentials; a non-zero exit means failure:

```bash
scripts/verify-deploy.sh
curl -si https://dev-dorak-backend.io/api/v1/public/sitemap   # 200 with brands, branches, stylists
curl -si https://dorak-bay.vercel.app/robots.txt              # Disallow lines and a Sitemap line
curl -si https://dorak-bay.vercel.app/sitemap.xml             # entries under <urlset>
```

The signed-in check is in the [`/me` contract](vercel-dashboard.md#backend-me-contract). Keep tokens and claims out of
logs, files and chat.
