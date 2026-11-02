---
nodeid: mobile.references.root.non-negotiable-rules
parentnode: mobile.guide
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Referenced from [`../../AGENTS.md`](../../AGENTS.md).

## 3. Non-negotiable rules

1. **One HTTP stack.** Everything goes through `ApiClient` in `packages/core`.
   Never add `http`, never construct a bare `Dio` outside core.
2. **One state-management approach.** **Bloc** — pure `bloc` in
   `packages/core`, `flutter_bloc` in `apps/*`. UI emits events, a `Bloc`
   owns business state, UI renders from state. No Riverpod, Provider or GetIt
   — prohibited. **`ChangeNotifier` is not a target pattern.** The session,
   unauthorized-signal and pagination `ChangeNotifier`s were migrated to
   `SessionBloc` + `ApiClient.unauthorizedStream` in Phase 4; the `.notifier`
   taxonomy role is gone. Do not reintroduce `ChangeNotifier` state.
3. **One navigation approach.** **`go_router` only** — declarative route table,
   redirects for the launch gate and auth guards, `context.push/go/pop` in
   screens. **Navigator 1.0 and `AppNavigator` are gone from `client_app`**
   (removed in Phase 2); `*.navigator.dart` is a deprecated taxonomy role,
   tolerated only in the untouched `business_app`/`stylist_app` stubs. Bloc
   never navigates — routing responds to state via the router's redirect and
   listener. Local modal-route dismissal uses `context.pop()`.
4. **No hardcoded user-visible strings.** Every string goes in **both**
   `app_en.arb` and `app_ar.arb`, then `flutter gen-l10n`. Arabic must be a real
   translation.
5. **No raw colours or text styles in app code.** Use
   `DorakColors.of(context)`, `DorakTypography.*`, `DorakDimensions.*`. Hex
   literals belong only in `packages/design_system/lib/src/tokens/`.
6. **DTOs are generated.** Every `*.dto.dart` uses `json_serializable`;
   hand-written `fromJson` is forbidden for anything that touches the wire.
   `.entity.dart` value objects may stay hand-written.
7. **One top-level public class per file.** Private helper classes in the same
   file are acceptable and used (see `skip_bottom_sheet.sheet.dart`).
8. **Do not invent backend endpoints.** The full surface is in
   `packages/core/lib/src/network/endpoints/`.
9. **Do not implement future Tracks early.** Check `docs/index.md` first.
10. **Never mark work done without running the gate** (§5).

---

