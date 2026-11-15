---
nodeid: dashboard.architecture
parentnode: dashboard.guide
childnodes: []
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

Routes: [dashboard guide](../../frontend/web/dashboard/AGENTS.md) · [ADR 0003: foundation](../adr/0003-new-dashboard-foundation.md) · [feature modules plan](../feature-modules-plan.md) · [documentation graph](../index.md).

## Application structure

- `src/app/` holds the App Router pages and layouts under `dashboard/[guard]/`
  (`login/` is public, `(portal)/` is the signed-in shell) and the route handlers
  under `api/`.
- `src/proxy.ts` guards `/dashboard/**`: it verifies the signed session claim,
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

When the UI needs a contract the backend does not provide, the backend is changed (see the
backend contract policy in the root [README](../../README.md)) rather than adding frontend
workarounds.

## Conventions and verification

Follow the [dashboard guide](../../frontend/web/dashboard/AGENTS.md) and the
[source layout rules](../../frontend/web/dashboard/src/README.md). Gates: `npm run lint`,
`npm run typecheck`, `npm test`, `npm run build`. Open work is tracked in the
[feature modules plan](../feature-modules-plan.md) and [open decisions](../backlog/index.md).
