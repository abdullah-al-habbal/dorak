---
nodeid: docs.adr_0003
parentnode: docs.decisions
childnodes: []
codeanchors:
  - frontend/web/new-dashboard/
  - backend/modules/Dashboard/
---

# ADR 0003 — Dashboard foundation: BFF sessions, fetch client, dictionary i18n

Status: `ACCEPTED` (dashboard foundation, 2026-11-04). Superseding context: the first
dashboard was archived on 2026-11-05, see [ADR 0004](0004-archive-legacy-dashboard.md).

## Decision

- **Session model.** The browser never talks to Laravel. Next route handlers
  call `/api/v1/dashboard/{login,refresh,logout,me}` server-side and keep the
  Sanctum token, signed claim and rotating refresh token in HttpOnly,
  `SameSite=Lax` cookies. The Zustand auth store holds only the verified `/me`
  profile, never a token. The backend has no CORS configuration, so
  browser-direct bearer auth would need backend changes and would expose
  tokens to XSS.
- **HTTP client.** A typed `fetch` wrapper with a single-flight refresh and one
  retry on 401. No axios.
- **Localization.** Typed EN/AR dictionaries resolved from the `NEXT_LOCALE`
  cookie, then `Accept-Language`. No i18n library. `<html lang dir>` is set
  before paint from the cookie and corrected by the provider.
- **Guards.** `/dashboard/[guard]` for `admin`, `manager`, `barber`, `owner`
  (`owner` is the brand-owner portal from ADR 0001). The actor list lives in
  `config/auth-actors.constant.ts`.
- **Route protection.** `proxy.ts` verifies the claim, refreshes once, and
  redirects; the portal layout re-verifies the session with `/me`.

## Known backend gaps (not changed here)

- No dashboard forgot/reset-password endpoint, so the sign-in screen only
  points users to their administrator.
- Dashboard routes outside `/me` and `/profile*` ignore the stored locale
  preference and `Accept-Language`.
- Access tokens are not revoked on refresh; they expire at their own TTL.
