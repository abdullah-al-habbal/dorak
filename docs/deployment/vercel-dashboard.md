---
nodeid: docs.deployment.vercel-dashboard
parentnode: docs.deployment
childnodes: []
codeanchors:
  - frontend/web/dashboard/
  - frontend/web/dashboard/.env.example
---

# Vercel dashboard hosting (MVP)

Part of the [Dorak Deployment and Handover Guide](deployment-guide.md). Decision: the Next.js dashboard runs on Vercel's free (Hobby) tier for MVP validation. No GitHub workflow deploys it; Vercel builds it.

## Project

The Vercel project is `dorak` (team `abdullah-allhabals-projects`), served at `dorak-bay.vercel.app`. The guards are
`admin`, `manager`, `barber` and `owner`; other names are 404. What is deployed and what was probed is in
[dev environment status](dev-environment-status.md). The project settings need a Vercel sign-in and haven't been
inspected.

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
| Env `BOOKING_APP_URL` (optional) | Link of the Dorak app that the public profile pages' booking button opens; unset, the pages say booking is in the app |
| Env `PUBLIC_SITE_URL` (optional) | Public origin of the dashboard site, for canonical and social-preview URLs of `/brands/[slug]`, `/branches/[slug]`, `/stylists/[slug]`, and for `sitemap.xml` and the sitemap line of `robots.txt` (the sitemap is empty without it) |

The public profile pages are the only routes outside `/dashboard` that the proxy touches: for `/brands/[slug]`, `/branches/[slug]` and `/stylists/[slug]` it asks the backend (`BACKEND_API_URL`, `/api/v1/public/...`) first, and a 404 answer becomes a real HTTP 404. A backend error, a rate limit or an outage never becomes a 404; the page then shows its own "unavailable" state. The pages need the backend migrations that add `branches.slug` and `barbers.slug`. `sitemap.xml` reads the backend feed `GET /api/v1/public/sitemap` on each request (no cache; an outage gives an empty sitemap, never a wrong one), so the backend must be deployed before the dashboard.

The backend side of the secret lives in `shared/.env` on Hostinger (`backend/.env.example` documents `DASHBOARD_SESSION_SECRET` and `DASHBOARD_SESSION_SECRETS`). Never put the value in the repository or in logs.

## Owner actions

The open ones are in the [backlog](../backlog/index.md): the seeded admin password and secret rotation (RR-10, RR-13),
and the unregistered `dorak.ai` domain (RR-11). Also confirm in Settings, Git that a push to `master` deploys, and
review the Hobby tier limits before real traffic (non-commercial use only).

## Backend `/me` contract

`GET /api/v1/dashboard/me` (`Modules\Dashboard\Http\Actions\Shared\MeAction`, route in `modules/Dashboard/Routes/Api/V1/dashboard.php`) needs both `Authorization: Bearer <token>` and the `X-Dashboard-Session: <claim>` header. `POST /api/v1/dashboard/login` (body `{actor_type, email, password}`; `actor_type` is `admin`, `branch`, `barber` or `owner`) returns the pair in its JSON as `token` and `claim`, with `expires_in`, `refresh_token` and `refresh_expires_in`. The claim is signed with `DASHBOARD_SESSION_SECRET` (or the `DASHBOARD_SESSION_SECRETS` key ring) and is bound to that access token (`tid`) and that actor (`sub`, `actor_type`), so a bare bearer token, an expired or revoked claim, or a claim issued for another token is a 401. The dashboard's own `GET /api/auth/me` is a separate Next.js route that reads the session cookie.

The middleware (`DashboardAuthorizationMiddleware`) tries the guards `admin_api`, `branch_api`, `barber` and `client`, and the token must carry the `dashboard` ability. An inactive admin or a barber that is not enabled is a 401; a banned branch manager is a 403. The roles it assigns are `platform_admin` (admin), `branch_manager` (branch), `barber` and `brand_owner` (owner, a `client` account that owns a brand).

`/me` returns `id`, `actor_type`, `role`, `branch_id`, `brand_id`, `brand_ids`, `display_name` (the localized name in the request language), `email` and `permissions`. `permissions` is the token's abilities (`["dashboard"]` for a dashboard session), not a user-facing permission list. Route groups gate on the actor type: admin routes need `platform_admin`, earnings routes exclude admins, owner routes need `brand_owner`, brand routes accept admin or owner, schedule routes need a barber, and operations routes exclude barbers.

Revoke a test session with `POST /api/v1/dashboard/logout`, which also needs both headers: it revokes the claim, deletes the access token and revokes the refresh token. Do not print tokens or claims.

## Verifying after a change

`scripts/verify-deploy.sh` runs the read-only probes below plus the CORS preflight and exits non-zero on any failure or 5xx. It also posts an empty sign-in to `/api/v1/dashboard/login` with `Accept-Language: ar` (no credentials) and requires a 422 whose message is Arabic, which proves the language middleware and the Arabic lang files are deployed. The manual equivalents:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://dorak-bay.vercel.app/dashboard/admin/login      # 200
curl -s -X POST https://dorak-bay.vercel.app/api/auth/login -H 'content-type: application/json' \
  -d '{"actor":"admin","email":"nobody@example.com","password":"x"}'                                # 401 invalid_credentials from Laravel
curl -s https://dev-dorak-backend.io/api/v1/health                                                  # 200, status-only payload
```

A 5xx from the login probe means `BACKEND_API_URL` is missing or wrong.
