---
nodeid: mobile.guide
parentnode: repo.root
childnodes:
  - mobile.apps.business-app
  - mobile.apps.client-app
  - mobile.apps.stylist-app
  - mobile.docs
  - mobile.packages.core
  - mobile.packages.design-system
  - mobile.packages.feature-error-feedback
  - mobile.packages.localization
  - mobile.references.root.core-architecture
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
  - frontend/mobile/tool/check_taxonomy.dart
---

# Dorak Mobile Agent Guide

The one shared guide for `frontend/mobile/`; [CLAUDE.md](CLAUDE.md) imports it. It adds to the
[root guide](../../AGENTS.md). The Dart source has almost no comments, so check the
[client app decisions](apps/client_app/references/decisions.md) before "simplifying" something that looks odd.

## Before changing code

- Read the guides of every app or package you touch. A unit guide may narrow these rules, never relax them.

Units: [apps/client_app](apps/client_app/AGENTS.md), [apps/business_app](apps/business_app/AGENTS.md), [apps/stylist_app](apps/stylist_app/AGENTS.md), [packages/core](packages/core/AGENTS.md), [packages/design_system](packages/design_system/AGENTS.md), [packages/feature_error_feedback](packages/feature_error_feedback/AGENTS.md), [packages/localization](packages/localization/AGENTS.md).

- How it works: [core architecture](references/root/core-architecture.md) and the
  [state contract](docs/state-management/conventions.md) (read it before adding or changing a bloc).
- Documentation and what was built: [mobile documentation](docs/index.md) and the
  [feature index](docs/feature-index.md). Open work is in the [backlog](../../docs/backlog/index.md).

## Layers

| Layer | May depend on (local packages and boundary rules) |
|---|---|
| `packages/localization` | third-party packages only |
| `packages/design_system` | third-party packages only, including `go_router` ([ADR 0002](docs/architecture/decisions/0002-design-system-go-router.md)); never `core` or `localization`, so shared widgets take strings as parameters |
| `packages/core` | `localization`; pure `bloc` ([ADR 0001](docs/architecture/decisions/0001-bloc-in-core.md)); never `flutter_bloc`, `go_router`, `design_system` or app code |
| `packages/feature_*` | `design_system`, `core`, `localization` |
| `apps/*` | any package |

A lower layer never imports a higher one, and a package never imports an app.

## Rules

1. **One HTTP stack.** Requests go through `ApiClient` in `packages/core`. Never add `http` or build a
   `Dio` outside core. Apps use `dio` in tests only. A raw `DioException` never leaves `ApiClient`.
2. **State is Bloc.** UI emits events, a bloc owns business state, UI renders it. Pure `bloc` in core,
   `flutter_bloc` in apps. No Riverpod, Provider or GetIt, and no `ChangeNotifier` state.
   (`StaffSessionRefresh` only feeds a bloc stream to the router's refresh signal and holds no state.)
3. **Navigation is `go_router` only.** Routes live in `app.router.dart` and `app_routes.entity.dart`;
   redirects handle the launch gate and auth guards. Screens receive callbacks or use
   `context.push/go/pop`. A bloc never navigates. Don't add `.navigator.dart` files.
4. **No hardcoded user-visible strings.** Add each to both `app_en.arb` and `app_ar.arb`, with a real
   Arabic translation.
5. **No raw colours or text styles in app code.** Use `DorakColors.of(context)`, `DorakTypography` and
   `DorakDimensions`. Hex literals belong only in `design_system/lib/src/tokens/`.
6. **Wire models use codegen.** Every `*.dto.dart` uses `json_serializable` with a `part` file and
   `@JsonSerializable`; no hand-written `fromJson`. Use `fieldRename: FieldRename.snake`, `@JsonKey` for
   overrides and defaults, `createToJson: false` on response DTOs (requests use plain maps) and
   `genericArgumentFactories: true` on generic ones. Commit generated files. Plain `.entity.dart` value
   objects that never touch the wire may be hand-written.
7. **One top-level public class per file.** Private helper classes in the same file are fine. A contract
   and its implementation share a file (`TokenStorage` and `SecureTokenStorage`).
8. **Don't invent backend endpoints.** The client surface is `core/lib/src/network/endpoints/`, split by
   domain and exported by `endpoints.barrel.dart`; never one large endpoints file. A missing endpoint is a
   backend change under the root guide's contract policy.
9. **Never render `ApiException.message`.** Map the failure with `ErrorFeedback.from` from
   `feature_error_feedback`; server field errors pass through `SafeServerMessage`. Check
   `isUnauthorized` rather than `code` for an expired sign-in.

## Code quality

- Avoid `dynamic` where a type is known. Every public method and function declares its return type.
- Keep `build()` small: extract a widget once a section is its own concern. Branching, formatting and
  derived values belong in a bloc or an entity method.
- No magic strings or numbers for statuses and thresholds: use an enum or a named constant.
- Prefer guard clauses to nested `if`/`else`.

## File names

`lib/` files are `<subject>.<role>.dart`; files directly in `lib/` and generated files are exempt.
`tool/check_taxonomy.dart` enforces this and rejects any `analysis_options.yaml` below the workspace root.

| Roles | Allowed in |
|---|---|
| `screen`, `router` | apps |
| `token`, `theme` | `design_system` |
| `dto`, `entity`, `repository`, `endpoints` | core and apps |
| `storage` | core |
| `bloc`, `event`, `state` | apps, core, `feature_*` |
| `widget`, `sheet`, `provider`, `client`, `interceptor`, `exception`, `barrel` | any |

`provider` also names stateless presentation logic in feature packages, which may not hold `entity` files.

## Where new code goes

| Adding | Put it in |
|---|---|
| a page | `apps/<app>/lib/src/features/<feature>/<name>.screen.dart` |
| a widget used by one feature | that feature's `widgets/` |
| a widget reused across apps, or a shared loading, empty, error, offline or retry state | `packages/design_system/lib/src/widgets/` |
| a failed-request message | `ErrorFeedback` or `InlineError`; app-only wording stays in the app |
| a user-visible string | both ARB files, then `generate` |
| an API call | a repository in core, with its route in the matching `.endpoints.dart` |
| a wire model | a `.dto.dart` in core, then `build` |
| device persistence | a `.storage.dart` in core |
| feature state | a bloc in the feature folder |

Update `docs/feature-index.md` and the app's `docs/feature-index.md`.

## Design system and localization

- Check the existing shared widgets before creating one. `DorakTheme.forLocale(locale, brightness)`
  selects the Arabic font. It sets no `inputDecorationTheme`, so fields build their own decoration.
- ARB files are in `packages/localization/l10n/` (`app_en.arb` is the template). Keys are camelCase with a
  feature prefix; reuse a key before adding one. Generated output is committed.
- Right-to-left follows the locale. Use directional alignment (`TextAlign.start`,
  `AlignmentDirectional`); never hardcode left or right. Flip directional icons by `isRtl`.

## Commands

`melos` isn't on `PATH`. There is no `melos.yaml`; the scripts are in the workspace `pubspec.yaml`.

```bash
cd frontend/mobile
dart run melos run bootstrap  # resolve dependencies
dart run melos run generate   # gen-l10n and build_runner; run after editing ARB files
dart run melos run build      # build_runner only; run after editing a DTO
dart run melos run verify     # the gate: generate, analyze, taxonomy, test
```

`verify` must exit 0 before work is called done. Respect `.aiignore`.

## Tests

- Add a widget or bloc test for new or changed behaviour.
- Use the fakes in each package's `test/helpers/`. No real plugins or network.
- Create blocs inside the `testWidgets` body, not in `setUp`: outside the fake async zone their stream
  never delivers.
- `DorakApp`'s optional `tokenStorage` and `authRepository` are test seams only; `routerHarness` drives a
  real router without booting the app.
- For onboarding and auth widget tests set a phone viewport (`physicalSize` 1290×2796, ratio 3.0) and
  reset it in `addTearDown`. The test font is much wider than the app font, so a test overflow alone
  doesn't prove a device bug.
