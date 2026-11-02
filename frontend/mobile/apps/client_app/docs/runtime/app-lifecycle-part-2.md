---
nodeid: mobile.apps.client-app.runtime.app-lifecycle.part-2
parentnode: mobile.apps.client-app.runtime.app-lifecycle
childnodes: []
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

Part 2 of 4 · [Application Lifecycle — Dorak Client App (apps/client_app)](app-lifecycle.md) · [Previous](app-lifecycle.md) · [Next](app-lifecycle-part-3.md)

## 3. Implementation

`lib/app.dart`, in `_DorakAppState`:

```dart
late final AppLifecycleListener _lifecycleListener;

// initState, alongside the other external-signal wiring
_lifecycleListener = AppLifecycleListener(onResume: _probeSessionOnResume);

// dispose, first — before the blocs the callback talks to are closed
_lifecycleListener.dispose();

void _probeSessionOnResume() {
  final session = _sessionBloc.state;
  if (session.status == AuthStatus.unknown) return;
  if (session.isLoading) return;
  _sessionBloc.add(RestoreRequested());
}
```

That is the entire feature. **No new bloc, no new event, no new state field, no
routing change.** `RestoreRequested` and `SessionBloc` already existed and are
reused verbatim.

### Why `AppLifecycleListener`

Flutter offers two APIs for this. `AppLifecycleListener` (Flutter 3.13+; the repo
runs 3.44) is preferred over the older `WidgetsBindingObserver` mixin because:

| | `AppLifecycleListener` | `WidgetsBindingObserver` |
|---|---|---|
| Registration | self-registering, `dispose()` unregisters | manual `addObserver` / `removeObserver` |
| Resume detection | `onResume` — fires on the transition | `didChangeAppLifecycleState`, hand-compare states |
| Scope | one object, one callback | mixin on `State`, all lifecycle callbacks |

The mixin form would require adding a mixin to `_DorakAppState`, storing the
previous `AppLifecycleState`, and comparing it by hand to distinguish *resumed*
from *already resumed*. `onResume` is edge-triggered by the framework, so that
bookkeeping disappears. Fewer moving parts, one owner, one `dispose`.
