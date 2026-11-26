---
nodeid: mobile.core.interceptors
parentnode: mobile.docs
childnodes:
  - mobile.core.interceptors.part-2
codeanchors:
  - frontend/mobile/packages/core/lib/
---

# Interceptors & API Infrastructure

Status: `DONE`

## Purpose

Request/response plumbing shared across all apps, registered once in
`ApiClient` (`lib/src/network/api.client.dart`). Registration order:

```text
Locale → [Auth] → [Logging] → Retry
```

## LocaleInterceptor

Sends the current locale on every request. `ApiClient.localeResolver`
returns the active `Locale`; the interceptor sets `Accept-Language`
(and `?locale=` where a handler expects it). Falls back to `'en'`.

## AuthInterceptor

Adds `Authorization: Bearer <token>` when a `tokenProvider` is supplied.
Provider returns `null`/empty → header omitted. Token rotation happens
outside the interceptor (session layer).

### Global 401/403 detection

`AuthInterceptor.onError` watches responses for a dead session and raises it
through a single channel:

```text
401/403 + bearer attached + not an auth-lifecycle path
        -> ACCOUNT_BANNED        -> ApiClient.reportAccountBanned()
        -> business-rule 403     -> nothing (the call site shows the error)
        -> 401 on an opted-out call -> nothing
        -> anything else         -> ApiClient.reportUnauthorized()
```

Both signals fire once per burst. `client_app` maps them to `SessionBloc`
events; `business_app` and `stylist_app` wire them with `StaffSessionSignals`,
which calls `StaffSessionBloc.unauthorized(code)` or `accountBanned()` and then
the app's teardown (push, realtime, route to login). `unauthorizedStream`
carries the answer's error code. The session keeps a reason for the login screen:
a ban, a brand suspension or `ACCOUNT_NOT_ACTIVE`. A later plain sign-out never
erases it; a suspension replaces "not active", and nothing replaces a ban.

A 403 `brand_suspended` keeps the session but is also sent on
`brandSuspendedStream` (every time). `business_app` ends a branch manager's
session with it (`StaffSessionSignals.brandSuspended()`) and re-reads an owner's
brand.

* **Business-rule 403** (`authInterceptorBusinessForbiddenCodes`):
  `brand_not_approved`, `brand_suspended`, `feature_not_enabled`. They reject
  one action, not the session. An unlisted 403 ends the session, so add a code
  here when the backend introduces another business-rule 403.
* **Opted-out 401**: `ApiClient.delete(..., keepSessionOn401: true)`, used only
  by the two account-deletion calls, whose 401 means the submitted password was
  wrong. A token that really expired is caught by the next request. It does not
  affect 403 or bans.

Conditions — all three must hold before anything fires:

* `response.statusCode` is `401` or `403`.
* The outgoing request carried `Authorization: Bearer` — a guest's request has
  no token, so its 401s are not session expiries.
* The path is not an auth-lifecycle route. `AuthEndpoints` declares ten
  lifecycle routes (`login`, `register`, `logout`, `refresh-token`,
  `forgot-password`, `reset-password`, `email/verify`, `email/verify/send`,
  `password`) plus the dynamic `/client/social/*`; all are exempt because they
  own their own 401 semantics in the repository/session layers. `refresh-token`
  is the restore probe — its 401 must keep meaning "clear token, guest", not
  "session expired". Every other authenticated route (future `/client/profile`
  etc.) correctly triggers the global state.

## Continued in

- [Part 2: LoggingInterceptor](interceptors-part-2.md)
