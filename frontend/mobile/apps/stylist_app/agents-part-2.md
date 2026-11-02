---
nodeid: mobile.apps.stylist-app.part-2
parentnode: mobile.apps.stylist-app
childnodes: []
codeanchors:
  - frontend/mobile/apps/stylist_app/lib/
---

Part 2 of 2 · [AGENTS.md — apps/stylist_app](AGENTS.md) · [Previous](AGENTS.md)

## 3. Bringing it into the monorepo

Do this before any feature work, and copy `client_app` rather than improvising:

1. **Add the workspace dependencies** (`core`, `design_system`, `localization`,
   `flutter_localizations`) — see [`CLAUDE.md`](./CLAUDE.md) §2.
2. **Replace the scaffolding.** Delete `MyApp` / `MyHomePage` / `_counter` and
   the stray comment lines. Split bootstrap into `lib/main.dart` +
   `lib/app.dart` exactly as `client_app` does: binding init → dotenv →
   `SharedAppPreferences.create()` → root widget.
3. **Wire `ApiClient` with `tokenProvider`**, or `AuthInterceptor` never
   installs and every request goes out unauthenticated with no error.
4. **Set up localization** — `localizationsDelegates`, `supportedLocales`, and
   `DorakTheme.forLocale(locale, brightness)`. All three apps share one ARB
   pair; add stylist keys there.
5. **Rewrite `test/widget_test.dart`.** It still asserts the counter increments
   and will fail the moment the scaffolding goes.
6. **Decide the auth story.** `SessionBloc` and the `/client/*` routes are
   customer-specific. A barber authenticates against a different guard — do not
   reuse the client session layer without checking the contract.

## 4. Constraints

- Everything under `lib/src/` must carry a valid role suffix — `.screen.dart`,
  `.widget.dart`, `.navigator.dart` and so on. Files at `lib/` root are exempt,
  which is why the current `main.dart` passes.
- `.screen.dart` is permitted here (apps only). `.navigator.dart` is still
  accepted for this stub but is **deprecated** — when work starts, mirror
  `client_app`'s go_router layout (`app.router.dart`), and use `.router.dart`,
  `.bloc.dart`, `.event.dart`, `.state.dart` roles. `.token.dart`, `.theme.dart`
  and `.storage.dart` are not.
- Check the current execution point in `docs/index.md` before starting. No Track
  is dedicated to this app yet.

## 5. Commands

```bash
cd apps/stylist_app
flutter run
flutter test

cd frontend/mobile && dart run melos run verify
```
