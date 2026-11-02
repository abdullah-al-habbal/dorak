---
nodeid: mobile.core.session.part-2
parentnode: mobile.core.session
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 2 of 5 · [Session Management](session.md) · [Previous](session.md) · [Next](session-part-3.md)

```dart
SessionState {                 // SessionBloc — the session truth
  AuthStatus status;
  ClientDto? client;
  bool isAuthenticated;
  bool isLoading;
  Object? error;
  SessionSignal signal;
}
Future<void> get ready;   // completes when restore has resolved status

AuthState {                    // AuthBloc — active auth actions
  ClientDto? client;
  bool isSubmitting;
  Object? error;
  AuthSignal signal;
}
```

`ready` memoises the restore pass (`_restoration ??=`), so concurrent awaiters
join the in-flight restore instead of firing a second one. Re-adding
`RestoreRequested` after `ready` would run the probe again — don't.

`SessionBloc` and `AuthBloc` are **independent**. The app layer coordinates them
through `coordinateAuthSuccess`
(`apps/client_app/lib/src/core/session/auth_coordination.entity.dart`), used by
both `DorakApp` and the test harness so the two cannot drift.

It fires on **`AuthSignal.loginSucceeded` / `registrationSucceeded` only** —
never on "the state happens to carry a client". That distinction is the fix for
a real defect: `AuthState.client` persists across emissions, so a trigger of
`client != null` re-authenticated the session on the `isSubmitting: true`
emission of a *later, failing* login attempt. Two guards now make that
impossible:

- `AuthSignalAcknowledged` clears the client as well as the signal, so no stale
  client survives the navigation that consumed the signal;
- `SessionAuthenticated` is ignored while a `sessionExpired` signal is
  in flight or unacknowledged.

A duplicate `SessionAuthenticated` for an already-authenticated client is a
no-op.

**Listener order matters.** `DorakApp.initState` subscribes the coordinator
*before* constructing `AppRouter`. Broadcast listeners run in subscription
order, so the session is updated before the router navigates and acknowledges.
`test/helpers/fakes.dart` (`sessionPair`) preserves the same order.
