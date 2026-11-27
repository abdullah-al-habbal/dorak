---
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

# Guards

- **Launch gate.** `AppGate.resolve` runs once after the splash ([launch](../flows/app-launch.md)).
- **Redirect.** `AppRouter._redirect` does one thing: it holds the app on `/splash` while `SessionState.status` is
  `unknown`. There are no per-route guards.
- **Guest actions.** An action that needs an account sends `RequireAuthentication`, and the router pushes sign-in on
  top ([routes](routes.md#signals)).
- **Expired session.** A 401 or 403 on an authenticated request raises `ApiClient.unauthorizedStream`
  ([interceptors](../core/interceptors.md)). The app sends `UnauthorizedDetected` to `SessionBloc`, which clears the
  token before it emits `sessionExpired`; a synchronous latch makes a burst of failures expire the session once.
  While that signal is unacknowledged, a late sign-in success is ignored.
- **Banned account.** `ApiClient.accountBannedStream` leads to the `accountBanned` signal.

```bash
cd apps/client_app && flutter test test/app_gate_test.dart test/session_expired_test.dart
```
