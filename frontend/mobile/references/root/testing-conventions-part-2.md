---
nodeid: mobile.references.root.testing-conventions.part-2
parentnode: mobile.references.root.testing-conventions
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Part 2 of 2 · [testing conventions](testing-conventions.md) · [Previous](testing-conventions.md)

Rules:

- Use the fakes in `client_app/test/helpers/fakes.dart` and
  `core/test/helpers/{fake_dio,fake_auth}.dart`. Never hit a real plugin or a
  real network.
- **Construct `Bloc`s inside the `testWidgets` body, never in `setUp`.** A bloc
  built in `setUp` lives outside the FakeAsync zone, so its event stream never
  delivers and `await session.ready` hangs. Build it in the body (or in a
  helper called from the body), then drive it with `pump`/`pumpAndSettle`.
- `DorakApp` takes optional `tokenStorage` and `authRepository` **purely as
  test seams**. Leave them null in production.
- `routerHarness(AppRouter)` builds a real `go_router`-driven
  `MaterialApp.router` so flows can be driven without booting `DorakApp`.
- **Set a phone viewport** for onboarding/auth widget tests:
  `tester.view.physicalSize = const Size(1290, 2796)` with
  `devicePixelRatio = 3.0` and `addTearDown(tester.view.reset)`. The 800×600
  default overflows these screens.
- The test fallback font renders every glyph at full em width, roughly **twice**
  IBM Plex. A `RenderFlex overflowed` in a test is not proof of a device bug —
  measure before "fixing" layout.

---
