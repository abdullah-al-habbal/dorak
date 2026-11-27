---
nodeid: mobile.flows.app-launch
parentnode: mobile.docs
childnodes: []
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

# App launch (client app)

`main.dart` loads `.env`, creates `SharedAppPreferences` and `SharedFeedCache`, and runs `DorakApp`. `DorakApp`
(`app.dart`) builds the shared services and blocs and the `AppRouter`. It forwards the API client's unauthorized and
banned-account streams to the session. Restoring the session runs alongside the splash and isn't awaited at start.

The splash is the first route. It waits 2500 ms and calls the router, which waits for `session.ready` and asks
`AppGate.resolve`:

| Signed in | Profile completed | "Don't show again" | Destination |
|---|---|---|---|
| Yes | Yes | ignored | Home (the Discover tab) |
| Yes | No | ignored | Profile completion |
| No | ignored | Yes | Home |
| No | ignored | No | Sign-in entry |

Sign-in is checked before the onboarding flag. A rejected stored token is cleared and the device is a guest. A
network failure during restore keeps the stored session.

```bash
cd apps/client_app && flutter test test/widget_test.dart test/app_gate_test.dart
```
