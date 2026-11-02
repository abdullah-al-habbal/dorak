---
nodeid: mobile.apps.business-app.claude
parentnode: mobile.apps.business-app
childnodes:
  - mobile.apps.business-app.claude.part-2
codeanchors:
  - frontend/mobile/apps/business_app/lib/
---

# CLAUDE.md — `apps/business_app`

Scoped rules for this app. Inherits [`../../CLAUDE.md`](../../CLAUDE.md).
Current state: [`AGENTS.md`](./AGENTS.md).

---

## 1. What this app is

The business-owner app: branch and brand management, staff, bookings, reports.

**It is an untouched `flutter create` counter stub.** Nothing below describes
existing code — it is the contract for when work starts.

## 2. Dependency ceiling

Permitted: `core`, `design_system`, `localization` as workspace path
dependencies, plus third-party packages.

**It currently declares none of them** — only `flutter`, `cupertino_icons` and
`flutter_dotenv`. Add them when implementation begins:

```yaml
dependencies:
  core: {path: ../../packages/core}
  design_system: {path: ../../packages/design_system}
  localization: {path: ../../packages/localization}
  flutter_localizations: {sdk: flutter}
```

Forbidden: importing `client_app` or `stylist_app`, and importing any package's
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
