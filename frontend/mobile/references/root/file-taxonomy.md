---
nodeid: mobile.references.root.file-taxonomy
parentnode: mobile.guide
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Referenced from [`../../AGENTS.md`](../../AGENTS.md).

## 4. File taxonomy

Filenames are `<subject>.<role>.dart`. Enforced by `tool/check_taxonomy.dart`
— a file under any `lib/` subdirectory with no valid role suffix fails the gate.

| Role | Purpose | Allowed in |
|---|---|---|
| `.screen.dart` | full-page scaffolds | `apps/*` only |
| `.widget.dart` | reusable UI components | anywhere |
| `.sheet.dart` | bottom sheets / modals | anywhere |
| `.token.dart` | colour/type/dimension tokens | `design_system` only |
| `.theme.dart` | ThemeData construction | `design_system` only |
| `.entity.dart` | domain value objects (no JSON) | `core`, `apps/*` |
| `.dto.dart` | wire models (codegen) | `core`, `apps/*` |
| `.endpoints.dart` | route constants, domain-split | `core`, `apps/*` |
| `.repository.dart` | data-source contract + impl | `core`, `apps/*` |
| `.provider.dart` | state / DI | `core`, `apps/*` |
| `.storage.dart` | device persistence | **`core` only** |
| `.navigator.dart` | **DEPRECATED** — legacy route-flow coordinators (removed from `client_app` in Phase 2) | only `business_app`/`stylist_app` stubs |
| `.router.dart` | declarative `go_router` route table | `apps/*` only |
| `.bloc.dart` / `.event.dart` / `.state.dart` | Bloc feature state (Phase 3) | `core`, `apps/*`, `packages/feature_*` |
| `.client.dart` `.interceptor.dart` `.exception.dart` `.barrel.dart` | as named | anywhere |

Files directly at `lib/` root (`main.dart`, `app.dart`, `core.dart`) are exempt.
Generated files, `build/`, `.dart_tool/`, and desktop `.plugin_symlinks/` are
skipped.

Abstract contract + concrete implementation live in the **same** file
(`AuthRepository` + `DioAuthRepository`, `TokenStorage` + `SecureTokenStorage`).
Follow that pattern; do not split them.

---

