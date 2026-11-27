---
codeanchors:
  - frontend/web/dashboard/src/app/
  - frontend/web/dashboard/src/proxy.ts
  - frontend/web/dashboard/src/services/api/
  - frontend/web/dashboard/src/config/routes.constant.ts
---

# Dashboard Frontend Architecture

This guide records the architecture present in `frontend/web/dashboard/`, the only
dashboard in the monorepo. The code and the decision records are the source of truth;
this file routes contributors to them.

Routes: [dashboard guide](../../frontend/web/dashboard/AGENTS.md) · [ADR 0003: foundation](../adr/0003-new-dashboard-foundation.md) · [documentation graph](../index.md).

## Application structure

- `src/app/` holds the App Router pages and layouts under `dashboard/[guard]/`
  (`login/` is public, `(portal)/` is the signed-in shell) and the route handlers
  under `api/`.
- `src/proxy.ts` also gates the public profile pages (`/brands/[slug]`, `/branches/[slug]`, `/stylists/[slug]`): a slug the backend reports as unknown or hidden is rewritten to `/_not-found` with status 404, because a page that streams its body cannot change the status after the shell is sent (`services/api/public/public-profile-gate.ts`). It guards `/dashboard/**`: it verifies the signed session claim,
- `src/app/sitemap.ts` and `src/app/robots.ts` serve `/sitemap.xml` and `/robots.txt`. The sitemap lists the brand, branch and stylist profiles from the backend feed `GET /api/v1/public/sitemap` (same visibility rules as the profile endpoints, at most 10,000 per kind) and is empty when `PUBLIC_SITE_URL` is unset or the backend is down. `robots.txt` allows `/`, disallows `/dashboard/` and `/api/`, and links the sitemap. Every other page is `noindex` by default from the root layout; only a found profile sets `index`.
  refreshes once, and redirects by guard.
- `src/components/` holds `ui/` (shadcn on Base UI), layout, providers, overlays and
  feature UI such as `bookings/`.
- `src/services/api/` holds `auth/` (session, cookies, backend client), `core/` (browser
  fetch client), `proxy/` (the data forwarder), and the `query/` and `mutation/` actions.
- `src/config/` holds constants: actors, routes, cookies, nav, the proxy allow-list.
- `src/locales/` holds typed EN and AR dictionaries; Arabic switches the page to RTL.
- `tests/` mirrors `src/` and contains the Vitest suites.

## Authentication and data access

The browser never talks to Laravel. `app/api/auth/*` wraps the backend dashboard auth
endpoints and keeps the token, signed claim and refresh token in HttpOnly cookies.
`app/api/dashboard/[...path]` is a thin, default-deny forwarder: it checks the path, method
and guard against `config/proxy-allow-list.constant.ts`, attaches the Bearer token, the
session claim and `Accept-Language`, and returns the backend envelope unchanged. It never
renames paths or reshapes data; Laravel stays the authority for authorization and branch
scope. Read [ADR 0003](../adr/0003-new-dashboard-foundation.md) before changing this boundary.

### Forwarding and errors

- A path that matches no rule, or has a `.` or `..` segment, is 404; a listed path with the wrong method is 405 with
  `Allow`. No valid session is 401, and a guard the rule doesn't list is 403.
- Only the path, query string, body and the caller's address are passed on, with the token, session claim and locale
  added by the server. Bodies are JSON up to 256 KiB, except on rules flagged `upload: true`. Calls time out after 15
  seconds, and redirects aren't followed.
- A successful reply keeps the backend's `message`, `data` and `meta`. A 422 becomes 400 `invalid_request`, with the
  field errors when the backend sent them and its own message when it didn't. A 409 keeps the backend's message
  (`services/api/proxy/forward.ts`, `services/api/auth/failure-map.util.ts`).
- The forwarder doesn't refresh sessions. On a 401 the browser client refreshes once and retries
  (`services/api/core/client.ts`).

When the UI needs a contract the backend does not provide, the backend is changed (see the
backend contract policy in the root [README](../../README.md)) rather than adding frontend
workarounds.

## Conventions and verification

Follow the [dashboard guide](../../frontend/web/dashboard/AGENTS.md) and the
[source layout rules](../../frontend/web/dashboard/src/README.md). Gates: `npm run lint`,
`npm run typecheck`, `npm test`, `npm run build`. Open work is tracked in the
[backlog](../backlog/index.md).
