---
codeanchors:
  - frontend/mobile/
---

# Dorak principles for a Stitch conversion

All paths are relative to `frontend/mobile/` (the Melos workspace root). Authority, in order: `AGENTS.md` (taxonomy, layering, rules), the target app/package `AGENTS.md`, then the documents under `docs/`. If this file disagrees with those, they win; report the drift.

| Principle | Rule |
| --- | --- |
| Atomic files | One top-level class per file, dot-suffix role (`.screen .widget .sheet .token .theme .entity .dto .endpoints .repository .provider .storage .router .bloc .event .state .barrel`). Enforced by `tool/check_taxonomy.dart`. `.navigator.dart` is deprecated. |
| Layering | Tokens/theme/shared widgets in `packages/design_system`; strings in `packages/localization`; DTOs/repositories/endpoints/pure Blocs in `packages/core`; screens and feature widgets in `apps/*/lib/src/features/<feature>/`. Apps import packages, packages never import apps. `design_system` imports no `localization` and no `core`. |
| Strings | Every user-visible string goes in BOTH `app_en.arb` and `app_ar.arb`, then `flutter gen-l10n`. Design-system widgets receive strings as constructor params. |
| Styling | App widgets use `DorakColors.of(context)`, `DorakTypography.*`, `DorakDimensions.*`. A raw `Color(0x...)` outside `*.token.dart` is a defect. |
| State | Bloc: UI emits events, a Bloc owns state, UI renders state. Pure `bloc` in `core`, `flutter_bloc` in apps. No Riverpod/Provider/GetIt; no `ChangeNotifier` state. |
| Navigation | `go_router` only. Routes live in `app.router.dart` + `app_routes.entity.dart`. Screens use `context.push/go/pop` or router-wired callbacks. A Bloc or a screen body never owns route tables; no Navigator 1.0, no `AppNavigator`. |
| DTOs | `build_runner` + `json_serializable`; hand-written `fromJson` is forbidden for wire models. Regenerate with `dart run melos run build`; commit `*.g.dart`. Plain value objects (for example `discovery_card.entity.dart`) may stay hand-written. |
| Real data | Stitch demo data is illustrative. Production code uses backend/domain models (see `export-mapping.md`). |
| Assets | Local assets under `apps/*/assets/images/`, declared in `pubspec.yaml`. Never `Image.network` for critical UI without a local fallback. |
| Evidence | Nothing is "done" until the gate in `gates-and-cleanup.md` ran and you saw it pass. |
