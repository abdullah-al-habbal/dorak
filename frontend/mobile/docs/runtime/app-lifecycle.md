---
nodeid: mobile.runtime.app-lifecycle
parentnode: mobile.docs
childnodes: []
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

# Application lifecycle (client app)

`DorakApp` (`apps/client_app/lib/app.dart`) owns one `AppLifecycleListener`, created in `initState` and disposed
with it, so rebuilds don't add listeners. On resume, `_probeSessionOnResume` sends `RestoreRequested` again, because
a token can be revoked while the app is in the background. It does nothing while the status is `unknown` (the startup
restore owns it) or while a restore or sign-out is running.

The restore has the same results as at start ([session](../core/session.md)): a valid token is rotated and kept; a
401 or 403 clears it and the device becomes a guest; a network failure keeps the session. Other lifecycle states are
ignored.

**Limitation:** a resume that finds a revoked token raises no signal, so the user stays on the current screen in the
guest state. There are no per-route guards ([guards](../navigation/guards.md)).

`business_app` and `stylist_app` have no resume listener. Tests: the `application lifecycle` group in
`apps/client_app/test/widget_test.dart`, driven through the full chain `inactive → hidden → paused → hidden →
inactive → resumed`, because the framework rejects jumps.
