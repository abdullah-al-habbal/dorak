---
nodeid: mobile.references.state-and-navigation
parentnode: mobile.guide
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Referenced from [`../CLAUDE.md`](../CLAUDE.md).

## 3b. State & Navigation Architecture (locked)

**State — Bloc.** UI emits events; a `Bloc` owns business state; UI renders
from state. Pure `bloc` in `packages/core`, `flutter_bloc` in `apps/*`. No
Riverpod, Provider or GetIt. **`ChangeNotifier` is not a target pattern** — the
session, unauthorized-signal and pagination notifiers were migrated to
`SessionBloc` / `ApiClient.unauthorizedStream` (Phase 4) and the `.notifier`
taxonomy role is removed. Do not reintroduce `ChangeNotifier` state.

**Navigation — go_router only.** Declarative route table, redirects for the
launch gate and auth guards, `context.push/go/pop` in screens. Navigator 1.0
and `AppNavigator` are removed from `client_app`; `.navigator.dart` is a
deprecated taxonomy role tolerated only in the `business_app`/`stylist_app`
stubs. Bloc never navigates — routing responds to state via redirects and the
router listener. Local modal dismissal uses `context.pop()`. Routing lives in
the router (`app.router.dart` + `app_routes.entity.dart`), never in a screen or
bloc.

