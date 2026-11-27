---
nodeid: mobile.state-management.conventions.part-5
parentnode: mobile.state-management.conventions
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 5 of 5 · [State Management Conventions](conventions.md) · [Previous](conventions-part-4.md)

## 10. UI interaction

40. UI dispatches events and renders from state through `BlocBuilder`.
41. **Ephemeral widget state stays in `State`** — `TextEditingController`,
    `FocusNode`, `AnimationController`, cooldown `Timer`, obscure-text toggles.
    These are not application state and must not move into a bloc.
42. A screen never calls a repository, touches storage, or decides where to
    navigate next.
43. A widget never holds a bloc it was not given. Builders only render;
    navigation, dialogs and snackbars go in a `BlocListener` (or the listener of
    a `BlocConsumer`). Feature state is scoped to its route with a local
    `BlocProvider` and closed with it; only authentication, session and locale
    live at the root. Bloc, state and event files don't import Flutter's
    material or widgets libraries (`dart:ui show Locale` is fine), and a state
    manager never takes another one as a dependency.

## 11. Navigation separation

44. **A bloc never navigates.** `context.go`, `context.push`, or `Navigator.*`
    inside a `*.bloc.dart` is a defect.
45. Navigation reacts to a **one-shot signal** consumed and acknowledged by
    `AppRouter`. `SessionSignal` and `AuthSignal` are the reference.
46. **`go` versus `push` is a contract**: `sessionExpired` → `router.go`
    (replaces the stack, so a dead-session screen cannot be back-navigated
    into); `authenticationRequired` → `router.push` (back returns to the guest
    destination). See [`../navigation/guards.md`](../navigation/guards.md).
47. Routing lives in `app.router.dart` and `app_routes.entity.dart`, never in a
    screen or a bloc.

## 12. Testing

48. `blocTest` per transition. `expect` the **full emission sequence**, not only
    the final state.
49. **Construct blocs inside the `testWidgets` body, never in `setUp`.** A bloc
    built in `setUp` sits outside the FakeAsync zone, so its event stream never
    delivers and `await ready` hangs.
50. Hand-written fakes in `test/helpers/`. `mocktail` arrives transitively with
    `bloc_test` and must not be used for repositories or storage.
51. **Every `clearX` flag needs a test proving the field actually clears.** That
    bug class has shipped once.
52. A regression test must be shown to fail against the unfixed code. Otherwise
    it documents an assumption rather than protecting behaviour.
53. Widget tests set a phone viewport (`1290 × 2796`, dpr `3.0`) — the 800×600
    default overflows these screens.
54. No real network, no platform channels.

## Verification

```bash
cd frontend/mobile
dart run melos run verify
```
