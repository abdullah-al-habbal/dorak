---
nodeid: mobile.references.root.where-new-code-goes
parentnode: mobile.guide
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Referenced from [`../../AGENTS.md`](../../AGENTS.md).

## 14. Where does new code go?

| You are adding | Put it in |
|---|---|
| a full page | `apps/<app>/lib/src/features/<feature>/<name>.screen.dart` |
| a widget used by one feature | `.../features/<feature>/widgets/<name>.widget.dart` |
| a widget reused across apps | `packages/design_system/lib/src/widgets/` |
| a user-visible string | both ARB files, then `generate` |
| an API call | a `.repository.dart` in `packages/core`, route constant in the matching `.endpoints.dart` |
| a wire model | `packages/core/.../dto/<name>.dto.dart` + `build` |
| device persistence | `packages/core/lib/src/storage/<name>.storage.dart` |
| app routing | `apps/<app>/lib/src/core/navigation/app.router.dart` + `app_routes.entity.dart` (go_router) |
| feature state | a `<name>_bloc.dart` (`Bloc`) under `apps/<app>/lib/src/features/<feature>/` |

Then: `dart run melos run verify`, and update `docs/feature-index.md`,
`apps/<app>/docs/feature-index.md`, and the relevant Track in `docs/index.md`.
