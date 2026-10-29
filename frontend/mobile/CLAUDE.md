---
nodeid: mobile.claude
parentnode: mobile.guide
childnodes:
  - mobile.docs
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

# Dorak Monorepo — AI Agent & Developer Guidelines (`CLAUDE.md`)

> **Read [`AGENTS.md`](./AGENTS.md) first.** It is the entry point: current
> feature inventory, backend contract, testing conventions, and the design
> decisions that are not visible in the source (the Dart code carries almost no
> comments). This file is the normative taxonomy and layering contract that
> `AGENTS.md` summarises.
>
> **This file is the parent rulebook.** Every app and package carries its own
> scoped `CLAUDE.md` that inherits from it and narrows further — dependency
> ceiling, permitted file roles, unit-specific prohibitions. Read the child for
> whatever you are editing:
>
> | Unit | Scoped rules | Inventory |
> |---|---|---|
> | `apps/client_app` | [`CLAUDE`](./apps/client_app/CLAUDE.md) | [`AGENTS`](./apps/client_app/AGENTS.md) |
> | `apps/business_app` | [`CLAUDE`](./apps/business_app/CLAUDE.md) | [`AGENTS`](./apps/business_app/AGENTS.md) |
> | `apps/stylist_app` | [`CLAUDE`](./apps/stylist_app/CLAUDE.md) | [`AGENTS`](./apps/stylist_app/AGENTS.md) |
> | `packages/core` | [`CLAUDE`](./packages/core/CLAUDE.md) | [`AGENTS`](./packages/core/AGENTS.md) |
> | `packages/design_system` | [`CLAUDE`](./packages/design_system/CLAUDE.md) | [`AGENTS`](./packages/design_system/AGENTS.md) |
> | `packages/localization` | [`CLAUDE`](./packages/localization/CLAUDE.md) | [`AGENTS`](./packages/localization/AGENTS.md) |
>
> A child never relaxes a parent rule. Where it is silent, the parent applies.

This repository is a deterministic, AI-native Flutter/Dart monorepo architecture for **Dorak**. All AI assistants and human developers must strictly follow the architectural boundaries, file naming taxonomy, and dependency constraints detailed in this document.

---

## 1. File Naming Taxonomy & Architectural Roles

All Dart files in this codebase **MUST** follow the explicit dot-suffix taxonomy:

`<domain_or_subject>.<architectural_role>.dart`

See [`references/file-taxonomy.md`](references/file-taxonomy.md) for the full role-suffix table.

### Strict Rules
1. **One Class Per File:** Every `.dart` file must contain exactly **one** top-level class or widget.
2. **Screen vs. Widget Boundary:** Full-page scaffolds (`.screen.dart`) reside strictly within executable apps (`apps/`). Shared packages export visual components (`.widget.dart`) or bottom sheets (`.sheet.dart`).
3. **Domain-Split Endpoints:** Monolithic endpoint files are strictly forbidden. Split network routes into domain files inside `endpoints/` (e.g., `auth.endpoints.dart`) and export via `endpoints.barrel.dart`.

## 2. Package Dependency & Layering Hierarchy

Bottom-up unidirectional flow — see [`references/dependency-layering.md`](references/dependency-layering.md) for the diagram and the full boundary matrix.

## 3. AI Governance & Navigation Rules

To maximize token efficiency and prevent auto-import collisions:

1. **Context Guardrails (`.aiignore`):** AI agents must not index build artifacts, generated code (`*.g.dart`, `*.freezed.dart`), Flutter/Dart tool caches (`.dart_tool/`), or backend builds.
2. **Navigation Map (`index.md`):** Consult the `index.md` file in subdirectories before performing recursive directory searches.
3. **No Cross-Layer Imports:** Do not import app-specific logic (`apps/*`) into packages (`packages/*`). Do not import `design_system` directly into `core`.

## 3b. State & Navigation Architecture (locked)

Bloc for state, go_router for navigation — locked architecture, see [`references/state-and-navigation.md`](references/state-and-navigation.md).

## 3c. Type Safety & Quality Governance

No `dynamic` escapes, lean `build()` methods, no magic literals, mandatory ARB
strings, mandatory tests, guard clauses — see
[`references/type-safety.md`](references/type-safety.md).

## 4. Development & Build Commands

Melos scripts (bootstrap, generate, build, analyze, test, verify) — see [`references/commands.md`](references/commands.md).

## 4b. Code Generation Policy (mandatory)

All `*.dto.dart` models MUST use `build_runner` + `json_serializable` codegen — hand-written `fromJson` is forbidden. Full policy: [`references/codegen-policy.md`](references/codegen-policy.md).

## Next Actions

All of the scaffolding this section used to request now exists:
`analysis_options.yaml`, `.aiignore`, and the root `index.md` are in place, and
the Melos configuration lives in the root `pubspec.yaml` (there is no separate
`melos.yaml`). `melos` is not on `PATH` — invoke it as `dart run melos run <script>`.

For what to work on next, see the **Current Execution Point** in
[`docs/index.md`](./docs/index.md). For everything else, see
[`AGENTS.md`](./AGENTS.md).
