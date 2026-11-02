---
nodeid: mobile.flows.app-launch
parentnode: mobile.docs
childnodes:
  - mobile.flows.app-launch.part-2
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

# App Launch

Status: `DONE`

## Bootstrap

`apps/client_app/lib/main.dart`:

```dart
WidgetsFlutterBinding.ensureInitialized();   // required before the plugins
await dotenv.load();
final preferences = await SharedAppPreferences.create();
runApp(DorakApp(preferences: preferences));
```

`DorakApp.initState` builds, in order: `SecureTokenStorage` → `ApiClient` (with
`tokenProvider`, which activates `AuthInterceptor`) → `DioAuthRepository` →
`AuthBloc` → `SessionBloc` → `OnboardingConfigBloc`, then constructs `AppRouter`
(go_router) and hands `_router.router` to `MaterialApp.router`. The app layer
coordinates the two session blocs: it forwards every `AuthBloc` success
(`state.client != null`) into `SessionBloc.add(SessionAuthenticated(...))`,
mirroring the same wiring used for `ApiClient.unauthorizedStream`.

It then kicks off `session.ready` **without awaiting it**, so restoration runs
concurrently with the splash animation and adds no wait of its own.

The splash is the router's **initial route** — it renders from the first frame.
No post-frame push.

## The gate

`SplashScreen` holds for 2500 ms and then advances via the router. The gate
itself is `AppGate.resolve`
(`apps/client_app/lib/src/core/navigation/app_gate.entity.dart`), invoked from
`AppRouter._redirect`.

The gate evaluates **two independent states in strict order**:

```text
await session.ready

Step A  session.isAuthenticated        -> /home
Step B  preferences.dontShowOnboarding -> /home
        otherwise                      -> /auth (entry)
```

Authentication always wins. A logged-in user never sees the auth entry or the
tour, whatever the onboarding flag says. A failed restore resolves to `guest`
and falls through to Step B — an expired or revoked token is simply treated as
"not authenticated".

## Continued in

- [Part 2: Resulting destinations](app-launch-part-2.md)
