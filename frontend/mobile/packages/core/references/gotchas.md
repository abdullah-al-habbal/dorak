---
nodeid: mobile.packages.core.references.gotchas
parentnode: mobile.packages.core
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Referenced from [`../AGENTS.md`](../AGENTS.md).

## 8. Gotchas

- **`AuthInterceptor` only installs when `tokenProvider != null`.** Omitting it
  silently produces unauthenticated requests with no error.
- **`endpoints.barrel.dart` is the only export path for endpoint files** —
  `network.barrel.dart` exports just the barrel. Add a new `*.endpoints.dart`
  to the barrel or `test/endpoints_barrel_test.dart` fails.
- **`register()` must send `password_confirmation`.** The backend applies
  Laravel's `confirmed` rule; omitting it 422s every signup.
- **Logout and verify return no `data` key.** Use a parser that ignores its
  argument (`_discardBody`), not one that casts.
- **A guard 401 bypasses the envelope**, arriving as bare
  `{"message":"Unauthenticated."}` → `ApiException(401, 'UNKNOWN')`. Branch on
  `isUnauthorized`, never on `code`.
- **Backend `message` is an untranslated key** (`core::messages.*`). Core
  passes it through unchanged; UI must never render it.
- **There is no `GET /client/me`** — which is why `restore()` probes with
  `refresh-token`.
- **`NetworkException` exposes `DioExceptionType`**, so any package
  constructing one in a test needs a `dio` dev dependency.
- **Feed cache never stores parsed DTOs** — wire payload only. See storage.
- **The feed cache has no TTL built in** — staleness is the consumer's call via
  `FeedCacheEntry.isStale`. A TTL inside the store would force re-fetch even
  when offline (the one case the cache exists for).
- **A 401/403 on an authenticated request is reported, not swallowed.**
  `ApiClient.unauthorizedStream` emits once per burst
  (`reportUnauthorized()` + `resetUnauthorizedSignal()`);
  `client_app` forwards it to `UnauthorizedDetected`, which surfaces the
  session-expired signal and the router redirects to auth.
