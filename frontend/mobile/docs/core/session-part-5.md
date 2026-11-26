---
nodeid: mobile.core.session.part-5
parentnode: mobile.core.session
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 5 of 5 · [Session Management](session.md) · [Previous](session-part-4.md)

## Global signals

Signals are split by owner, so each bloc's state is type-safe:

* `SessionSignal` (`none | sessionExpired | authenticationRequired`) lives on
  `SessionState`. `SessionBloc` raises `sessionExpired` (`UnauthorizedDetected`)
  and `authenticationRequired` (`RequireAuthentication`).
* `AuthSignal` (`none | loginSucceeded | registrationSucceeded |
  verificationSucceeded`) lives on `AuthState`. `AuthBloc` raises the matching
  value on auth success.

The router subscribes to **both** streams and switches each state's own signal
type, so a stale signal on one side never steers the other.
`registrationSucceeded` is the only signal that carries follow-up work: the
router dispatches `SendVerificationCodeRequested` and pushes the verify screen
with the client's email as `extra`.

Unauthorized flow:

* `ApiClient` owns a broadcast `unauthorizedStream`. `AuthInterceptor` calls
  `reportUnauthorized()` on a 401/403 for an authenticated, non-lifecycle
  request; the client fires **once per burst** and stays silent until
  `resetUnauthorizedSignal()`, so a burst of concurrent 401s collapses into one
  notification.
* The app layer forwards the signal to `UnauthorizedDetected`. The session bloc
  dedupes against an already-raised `sessionExpired`, clears the token, drops to
  `guest`, and raises the signal.
* The staff apps use `StaffSessionSignals` (`session/`): it subscribes to
  `unauthorizedStream` and `accountBannedStream`, ends the `StaffSessionBloc`
  session (`unauthorized()` or `accountBanned()`), then runs the app teardown.
  See `core/interceptors.md` for which responses raise neither signal.
* `RequireAuthentication` raises `authenticationRequired` (guest-guarded
  action) without touching the session.
* `SignalAcknowledged` clears a **session** signal; `AuthSignalAcknowledged`
  clears an **auth** signal — the app layer sends each after navigating,
  re-arming the signal channel for the next burst.

Any auth mutating event resets `signal` to `none`, so a fresh auth attempt
clears a stale prompt.

The app layer (`AppRouter`, see `navigation/guards.md`) owns the two stream
listeners that re-run the router redirect and react to signals. Core never
imports app code and never navigates.

## Not yet implemented

Social login and profile-edit endpoints. Password recovery and change-password
are built in `client_app` (`password_recovery` and `change_password` blocs).
`client_app` has no logout affordance: `SessionBloc` handles `LogoutRequested`
but no client screen dispatches it (`business_app` exposes logout on the
operations screen).

## Verification

```bash
dart run melos run analyze
dart run melos run test   # packages/core/test/{session_bloc,auth_bloc}_test.dart
```
