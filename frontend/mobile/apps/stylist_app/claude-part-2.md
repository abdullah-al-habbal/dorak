---
nodeid: mobile.apps.stylist-app.claude.part-2
parentnode: mobile.apps.stylist-app.claude
childnodes: []
codeanchors:
  - frontend/mobile/apps/stylist_app/lib/
---

Part 2 of 2 · [CLAUDE.md — apps/stylist_app](CLAUDE.md) · [Previous](CLAUDE.md)

## 4. Hard rules

Identical to `client_app` — they are monorepo rules, not app rules:

1. Screens are dumb; flow logic lives in `app.router.dart` (go_router).
2. Navigation through go_router (`AppRouter`), not scattered `Navigator.of(context)`.
3. No hardcoded strings — keys go in **both** ARB files in `localization`.
4. No raw colours or text styles — `design_system` tokens only.
5. One HTTP stack (`core`'s `ApiClient`), one state approach (**Pure Bloc**),
   one routing approach (**go_router**).
6. DI is constructor wiring in the root widget's `initState`. No service locator.
7. Never render a backend `message` field — it is an untranslated key.
8. Rationale goes in `AGENTS.md`, not in code comments.

## 5. Before writing features

1. Check the Track in `docs/index.md`. There is no Track dedicated to stylist
   screens; Track 18 (feature modules) and Track 19 (business screens) are the
   nearest, and both are `PENDING`.
2. Consume existing infrastructure — design system, core contracts, navigation,
   state management, repositories, localization, error handling. Do not
   recreate shared infrastructure.
3. Replace the `flutter create` scaffolding (`MyApp`, `MyHomePage`, `_counter`)
   rather than building around it, and update `test/widget_test.dart` at the
   same time — it still asserts the counter behaviour.
4. Note that `lib/main.dart` carries a few stray empty `//` comment lines from
   the template; remove them with the scaffolding.
5. Do not invent endpoints. `dorak-backend` exposes a `/barber` route group
   whose contract has not been reviewed for mobile.

## 6. Verification

```bash
cd frontend/mobile
dart run melos run verify
```
