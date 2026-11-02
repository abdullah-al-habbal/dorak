---
nodeid: mobile.apps.client-app.claude
parentnode: mobile.apps.client-app
childnodes:
  - mobile.apps.client-app.claude.part-2
codeanchors:
  - frontend/mobile/apps/client_app/lib/
---

# CLAUDE.md — `apps/client_app`

Scoped rules for this app. Inherits [`../../CLAUDE.md`](../../CLAUDE.md).
Inventory, flows and gotchas: [`AGENTS.md`](./AGENTS.md).

---

## 1. What this app is

The end-user (customer) app — the only one of the three with real features.
Discovery, booking, profile, and the auth + onboarding launch flow.

## 2. Dependency ceiling

Permitted: `core`, `design_system`, `localization` (all declared as workspace
path dependencies), plus third-party packages.

Forbidden: importing another app, and importing another package's `src/`
directly — always go through its barrel (`package:core/core.dart`,
`package:design_system/design_system.dart`, `package:localization/localization.dart`).

`dio` is a **test-only** dev dependency (constructing a `NetworkException` in a
fake needs `DioExceptionType`). Never import it from `lib/`.

## 3. Directory contract

```
lib/main.dart                    bootstrap only
lib/app.dart                     DorakApp — DI wiring + MaterialApp.router
lib/src/core/navigation/         app.router.dart (AppRouter) + app_routes.entity.dart + app_gate.entity.dart
lib/src/features/<feature>/      <name>.screen.dart + widgets/ + entities + <name>_bloc.dart
```

Files at `lib/` root are exempt from the taxonomy checker; everything under
`lib/src/` is not.

## Continued in

- [Part 2: 4. Hard rules](claude-part-2.md)
