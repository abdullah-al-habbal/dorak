---
nodeid: mobile.references.dependency-layering
parentnode: mobile.guide
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Referenced from [`../CLAUDE.md`](../CLAUDE.md).

## 2. Package Dependency & Layering Hierarchy

The dependency graph enforces a strict **bottom-up unidirectional flow**. Higher-level layers may depend on lower-level layers, but lower-level layers **NEVER** import higher-level ones.

```text
                  ┌─────────────────┐
                  │   apps/*        │ (client_app, business_app, stylist_app)
                  └────────┬────────┘
                           │
                  ┌────────┴────────┐
                  ▼                 ▼
              ┌──────┐       ┌─────────────────┐
              │ core │       │ design_system   │
              └───┬──┘       └─────────────────┘
                  │
                  ▼
           ┌──────────────┐
           │ localization │
           └──────────────┘

```

### Architectural Boundary Matrix

| Layer | Repository Path | Permitted Local Dependencies | Reusability Scope |
| --- | --- | --- | --- |
| **Global Docs & Config** | `/`, `/docs` | None | Root monorepo policy |
| **Design System** | `mobile/packages/design_system` | Third-party packages only — plus `go_router`, by [ADR 0002](../docs/architecture/decisions/0002-design-system-go-router.md) | All mobile apps & shared packages |
| **Localization** | `mobile/packages/localization` | Third-party packages only | All mobile apps & shared packages |
| **Shared Core** | `mobile/packages/core` | `localization`; pure `bloc` by [ADR 0001](../docs/architecture/decisions/0001-bloc-in-core.md) — never `flutter_bloc` or `go_router` | All mobile apps & feature packages |
| **Feature Packages** | `mobile/packages/feature_*` | `design_system`, `core`, `localization` | Selected mobile apps |
| **Executable Apps** | `mobile/apps/*` | All `packages/*` via path dependencies | Standalone binaries |

