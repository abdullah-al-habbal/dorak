---
nodeid: mobile.runtime.app-lifecycle
parentnode: mobile.docs
childnodes:
  - mobile.runtime.app-lifecycle.part-2
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

# Application Lifecycle

Status: `DONE`

Part of **Track 10** (`docs/index.md`). The remaining objective, "application
lifecycle", is implemented in `apps/client_app/lib/app.dart` and covered by
`apps/client_app/test/widget_test.dart`. This doc records the mechanism, the
guards, and the deliberately-owned gaps so they are not re-derived.

## What the app does on resume

`_DorakAppState` owns exactly one `AppLifecycleListener`, built in `initState`
and disposed in `dispose`:

```dart
_lifecycleListener = AppLifecycleListener(onResume: _probeSessionOnResume);
```

`_probeSessionOnResume` re-runs the session restore:

```dart
final session = _sessionBloc.state;

// The startup restore owns the `unknown` status. Racing it would resolve
// the session twice behind the splash's `session.ready` completer.
if (session.status == AuthStatus.unknown) return;

// A restore or logout is already running. `RestoreRequested` uses Bloc's
// default concurrent transformer, so a second one would overlap the first.
if (session.isLoading) return;

_sessionBloc.add(RestoreRequested());
```

## Why

A session can die while the app is backgrounded — Sanctum tokens carry no
server-side expiry and there is no push channel telling the client a token was
revoked. Without a resume probe the app keeps rendering authenticated UI until
some later request happens to return a 401.

`RestoreRequested` already defines the correct semantics (see
`docs/core/session.md`): a valid token rotates and stays; a 401/403 clears to
`guest`; a `NetworkException` (offline resume) keeps the session.

## Continued in

- [Part 2: Event coverage](app-lifecycle-part-2.md)
