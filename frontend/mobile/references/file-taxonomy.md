---
nodeid: mobile.references.file-taxonomy
parentnode: mobile.guide
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Referenced from [`../CLAUDE.md`](../CLAUDE.md).

### Mandatory Role Suffix Reference

| Role Suffix | Usage & Context | Permitted Locations |
| :--- | :--- | :--- |
| `.screen.dart` | Full-page scaffolds, routes, and page layouts. | `apps/*` only |
| `.widget.dart` | Reusable atomic UI components and view elements. | `packages/design_system`, `packages/feature_*`, `apps/*` |
| `.sheet.dart` | Bottom sheet overlays and modal dialogs. | `packages/feature_*`, `apps/*` |
| `.token.dart` | Design system visual tokens (colors, typography, spacing). | `packages/design_system` |
| `.theme.dart` | Theme configurations and extensions. | `packages/design_system`, `apps/*` |
| `.entity.dart` | Pure domain models and business entities. | `packages/core`, `apps/*/domain` |
| `.dto.dart` | Data Transfer Objects for network/storage serialization. | `packages/core`, `apps/*/data` |
| `.endpoints.dart` | Domain-split API route declarations. | `packages/core/network/endpoints` |
| `.repository.dart` | Repository contracts and implementations. | `packages/core`, `apps/*` |
| `.provider.dart` | State management and dependency injection providers. | `core`, `apps/*` |
| `.storage.dart` | Device persistence contracts and implementations (secure storage, preferences, cache). | `packages/core` only |
| `.navigator.dart` | **DEPRECATED** — legacy route-flow coordinators (removed from `client_app` in Phase 2) | only `business_app`/`stylist_app` stubs |
| `.router.dart` | Declarative `go_router` route table + redirects. | `apps/*` only |
| `.bloc.dart` / `.event.dart` / `.state.dart` | Bloc feature state (Phase 3). | `packages/core`, `apps/*`, `packages/feature_*` |
| `.barrel.dart` | Explicit package or feature re-exports. | Anywhere requiring grouped exports |

