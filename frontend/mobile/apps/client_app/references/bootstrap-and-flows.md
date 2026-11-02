---
nodeid: mobile.apps.client-app.references.bootstrap-and-flows
parentnode: mobile.apps.client-app
childnodes:
  - mobile.apps.client-app.references.bootstrap-and-flows.part-2
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Referenced from [`../AGENTS.md`](../AGENTS.md).

## 2. Bootstrap

```dart
// main.dart
WidgetsFlutterBinding.ensureInitialized();
await dotenv.load();
final preferences = await SharedAppPreferences.create();
runApp(DorakApp(preferences: preferences));
```

`DorakApp.initState` builds, in order: `SecureTokenStorage` → `ApiClient`
(with `tokenProvider`) → `DioAuthRepository` → `AuthBloc` →
`SessionBloc(repository, storage)` → `OnboardingConfigBloc` →
`LocaleBloc`, then starts `session.ready` **unawaited**
and constructs `AppRouter` (go_router, handed to `MaterialApp.router`). The app
layer coordinates the two session blocs: it forwards every `AuthBloc` success
(`state.client != null`) into `SessionBloc.add(SessionAuthenticated(...))`,
alongside the `unauthorizedStream` → `UnauthorizedDetected` forward and the
locale → config reload. The router (two stream listeners) and the api client
subscribe to their streams; all are closed in `dispose()`.

The splash is the router's initial route — it renders from the first frame.
No post-frame push.

Test seams: `DorakApp(tokenStorage:, authRepository:)`. Null in production.

## 3. The launch gate

`AppGate.resolve` — two independent checks, strict order, called from the
router's redirect:

```
await session.ready
A. session.isAuthenticated        -> /home
B. preferences.dontShowOnboarding -> /home
   otherwise                      -> /auth (entry)
```

| Scenario | authenticated | dontShowOnboarding | Lands on |
|---|---|---|---|
| New device | false | false | Auth Entry |
| Guest who saw the tour | false | true | Home |
| Returning logged-in user | true | ignored | Home |
| Just signed up | true | ignored | Home |
| Token revoked server-side | false (cleared) | as stored | B decides |
| Offline start with token | true (kept) | ignored | Home |

Authentication always outranks the onboarding flag.

## Continued in

- [Part 2: 4. Auth flow (Stitch 006–009, 011–014)](bootstrap-and-flows-part-2.md)
