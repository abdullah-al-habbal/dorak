---
nodeid: mobile.apps.stylist-app.claude
parentnode: mobile.apps.stylist-app
childnodes:
  - mobile.apps.stylist-app.claude.part-2
codeanchors:
  - frontend/mobile/apps/stylist_app/lib/
---

# CLAUDE.md — `apps/stylist_app`

Scoped rules for this app. Inherits [`../../CLAUDE.md`](../../CLAUDE.md).
Current state: [`AGENTS.md`](./AGENTS.md).

---

## 1. What this app is

The stylist/barber app: offered services, availability, schedule, reviews, job
applications.

**It is a working app** (see [`AGENTS.md`](./AGENTS.md) for the current
inventory). Sections 2–3 are the contract that code follows.

## 2. Dependency ceiling

Permitted: `core`, `design_system`, `localization` as workspace path
dependencies, plus third-party packages.

`dio` is a **test-only** dev dependency (a real `ApiClient` with a fake adapter,
or a `NetworkException` in a fake). Never import it from `lib/`.

It declares all three as workspace path dependencies, plus
`flutter_localizations`.

Forbidden: importing `client_app` or `business_app`, and importing any package's
`src/` directly — go through its barrel.

## 3. Directory contract — mirror `client_app`

```
lib/main.dart                    bootstrap only
lib/app.dart                     the root widget + DI wiring
lib/src/core/navigation/         app.router.dart + app_routes.entity.dart (go_router, mirror client_app)
lib/src/features/<feature>/      <name>.screen.dart + widgets/ + <name>_bloc.dart
```

Do not invent a different structure. `client_app` is the reference
implementation for bootstrap, the launch gate, navigation and testing.

## Continued in

- [Part 2: 4. Hard rules](claude-part-2.md)
