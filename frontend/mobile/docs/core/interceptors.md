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
        -> ApiClient.reportUnauthorized() (once per burst, stream)
        -> (app layer) SessionBloc.add(UnauthorizedDetected()) -> redirect
```

Conditions — all three must hold before anything fires:

* `response.statusCode` is `401` or `403` (treated identically).
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
