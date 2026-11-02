---
nodeid: mobile.navigation.guards.part-2
parentnode: mobile.navigation.guards
childnodes: []
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Part 2 of 2 · [Guards](guards.md) · [Previous](guards.md)

## Session-expired handling (DONE)

`AuthInterceptor` (`docs/core/interceptors.md`) raises a 401/403 on an
authenticated, non-auth-lifecycle request through `ApiClient.reportUnauthorized`
(broadcast `unauthorizedStream`, once per burst). The app layer routes it back
to auth:

```text
401/403 (authenticated, non-lifecycle)
  -> ApiClient.unauthorizedStream fires   (once per burst)
  -> (app) SessionBloc.add(UnauthorizedDetected())
  -> token cleared, then ONE emission:
       status: guest, client: null, signal: sessionExpired
  -> AppRouter listener -> router.go(/auth)          <- replaces the stack
  -> SignalAcknowledged + apiClient.resetUnauthorizedSignal()
```

`_onUnauthorizedDetected` clears the token **before** it emits, so a burst of
401s produces exactly one expiration and one redirect. A synchronous `_expiring`
latch closes the window during the `await` — the emitted-signal guard alone
cannot, because the signal is not set until after the clear completes.

`go` versus `push` is the contract:

- **`sessionExpired` → `router.go`** replaces the stack, so a dead-session
  screen can never be back-navigated into.
- **`authenticationRequired` → `router.push`** puts the auth entry **on top**,
  so back returns to the guest destination the user was on.

While a `sessionExpired` signal is unacknowledged, `SessionAuthenticated` is
ignored — a stale auth success cannot resurrect a session that just died.
Full wiring: `app.router.dart`, `auth_coordination.entity.dart`.

## Verification

```bash
cd apps/client_app && flutter test test/app_gate_test.dart
```
