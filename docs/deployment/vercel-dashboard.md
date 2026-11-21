---
nodeid: docs.deployment.vercel-dashboard
parentnode: docs.deployment
childnodes: []
codeanchors:
  - frontend/web/dashboard/
  - frontend/web/dashboard/.env.example
---

# Vercel dashboard hosting (MVP)

Part of the [Dorak Deployment and Handover Guide](deployment-guide.md). Decision: the Next.js dashboard runs on Vercel's free (Hobby) tier for MVP validation. No GitHub workflow deploys it; Vercel builds it. Verified 2026-11-21 and re-audited 2026-11-22 by probing the public domain and the GitHub commit status API (the Vercel dashboard itself needs a login and was not inspected).

## Current state

| Item | State |
|---|---|
| Project | `dorak` (Vercel team `abdullah-allhabals-projects`) |
| Production domain | `dorak-bay.vercel.app`; the per-deployment URL answers 302 (Vercel deployment protection or a redirect) |
| Deployment | Ready; built from `origin/master` at `ec7b19a39` (`docs(deployment): record APP_DEBUG=false on the dev host`). GitHub shows a `Vercel` commit status on that commit (`success`, "Deployment has completed", linking to the `dorak` project), so Vercel does read this repository. Whether a push to `master` **auto-deploys**, and which root directory the project uses, still needs the Vercel UI (Settings, Git and General) |
| Unpushed commits | `01dd7e123` (sign-in pole animation) and `210a1dd18` (deployment docs) exist only locally, so Vercel has not built `01dd7e123`; the live sign-in page predates it |
| Pages | `/` 200; `/dashboard/{admin,owner,barber}/login` 200 (`manager` not probed); `/dashboard/business/login` and `/dashboard/branch/login` 404 because those are not guards |
| Backend link | `POST /api/auth/login` with wrong credentials returned the backend's `401 invalid_credentials`, so `BACKEND_API_URL` is set and Hostinger is reachable from Vercel |
| No session | `GET /api/auth/me` returns `401 session_expired` |
| Sign-in | **Verified 2026-11-22**: the owner signed in at `/dashboard/admin` with the seeded admin, so `DASHBOARD_SESSION_SECRET` matches the backend's value (a "session setup failed" error would mean they differ). Backend proof: `POST /api/v1/dashboard/login` returned 200 and `GET /api/v1/dashboard/me` returned 200 with `actor_type: admin`, `role: platform_admin`, `permissions: ["dashboard"]`; without the `X-Dashboard-Session` claim header the same call returns 401 |
| **Not verified** | Vercel project settings (root directory, Node version, auto-deploy on push) |
| `dorak.ai` | **Not registered**: `dorak.ai` and `www.dorak.ai` return NXDOMAIN and whois reports "Domain not found" (2026-11-22). Nothing to attach until it is bought |

## Why no CORS or cookie changes are needed

The browser only calls the dashboard's own `/api/auth/*` and `/api/dashboard/*` routes. Only the Next.js server talks to Laravel (`BACKEND_API_URL`), so there is no cross-origin browser request to the backend. Session tokens live in `HttpOnly`, `SameSite=Lax`, `Secure` cookies set by the dashboard origin. CORS matters only for the Flutter Web bundles (see [CI/CD setup](ci-cd-setup.md)).

## Required configuration

Vercel project, Settings:

| Setting | Value |
|---|---|
| Root Directory | `frontend/web/dashboard` (the repository is a monorepo) |
| Framework preset | Next.js (auto-detected) |
| Node.js | 22 (what `dashboard-ci.yml` uses) |
| Env `BACKEND_API_URL` | `https://dev-dorak-backend.io` (origin only, no `/api`) |
| Env `DASHBOARD_SESSION_SECRET` | the same value as the backend's `DASHBOARD_SESSION_SECRET`, at least 32 characters |
| Env `DASHBOARD_SESSION_SECRETS` (optional) | JSON key ring `{"kid":"secret"}` for rotation; takes precedence |

The backend side of the secret lives in `shared/.env` on Hostinger (`backend/.env.example` documents `DASHBOARD_SESSION_SECRET` and `DASHBOARD_SESSION_SECRETS`). Never put the value in the repository or in logs.

## Owner actions still open

1. ~~Sign in once as the seeded admin~~ Done 2026-11-22. Remaining: change the seeded password and rotate the secret if it was exposed (backlog RR-10, RR-13).
2. Open Settings, Git in the Vercel project and confirm the repository is connected, production branch is `master` and the root directory is `frontend/web/dashboard`. After the owner pushes `01dd7e123`, check that a new `Vercel` status appears on the new `origin/master` commit; that proves auto-deploy. If it does not, redeploy by hand.
3. Decide on `dorak.ai`: it is unregistered. Register it and attach it to the project, or drop it from the docs.
4. Review the Hobby tier limits before real traffic: it is for non-commercial use.

## Backend `/me` contract

`GET /api/v1/dashboard/me` (`Modules\Dashboard\Http\Actions\Shared\MeAction`, route in `modules/Dashboard/Routes/Api/V1/dashboard.php`) needs both `Authorization: Bearer <token>` and the `X-Dashboard-Session: <claim>` header, which `POST /api/v1/dashboard/login` returns (body `{actor_type, email, password}`; `actor_type` is `admin`, `branch`, `barber` or `owner`). The claim is signed with `DASHBOARD_SESSION_SECRET`, so a bare bearer token gets 401. The dashboard's own `GET /api/auth/me` is a separate Next.js route that reads the session cookie. Revoke a test token with `POST /api/v1/dashboard/logout`. Do not print tokens or claims.

## Verifying after a change

`scripts/verify-deploy.sh` runs the read-only probes below plus the CORS preflight and exits non-zero on any failure or 5xx. The manual equivalents:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://dorak-bay.vercel.app/dashboard/admin/login      # 200
curl -s -X POST https://dorak-bay.vercel.app/api/auth/login -H 'content-type: application/json' \
  -d '{"actor":"admin","email":"nobody@example.com","password":"x"}'                                # 401 invalid_credentials from Laravel
curl -s https://dev-dorak-backend.io/api/v1/health                                                  # 200, status-only payload
```

A 5xx from the login probe means `BACKEND_API_URL` is missing or wrong.
