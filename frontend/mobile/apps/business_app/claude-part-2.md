---
nodeid: mobile.apps.business-app.claude.part-2
parentnode: mobile.apps.business-app.claude
childnodes: []
codeanchors:
  - frontend/mobile/apps/business_app/lib/
---

Part 2 of 2 · [CLAUDE.md — apps/business_app](CLAUDE.md) · [Previous](CLAUDE.md)

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

1. Check the Track in `docs/index.md`. Business screens are **Track 19**, and it
   is `PENDING` behind several foundation tracks.
2. Track 19 states plainly: business screens MUST consume the existing design
   system, core contracts, navigation, state management, repositories,
   localization and error handling — and **MUST NOT recreate shared
   infrastructure**.
3. Replace the `flutter create` scaffolding (`MyApp`, `MyHomePage`, `_counter`)
   rather than building around it. Update `test/widget_test.dart` at the same
   time — it still asserts the counter behaviour.
4. There is no backend module mapped to this app yet. Do not invent endpoints;
   `dorak-backend` exposes `/barber` and `/branch` route groups whose contracts
   have not been reviewed for mobile.

## 6. Verification

```bash
cd frontend/mobile
dart run melos run verify
```
