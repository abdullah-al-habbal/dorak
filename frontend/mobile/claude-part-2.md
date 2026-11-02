---
nodeid: mobile.claude.part-2
parentnode: mobile.claude
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Part 2 of 2 · [Dorak Monorepo — AI Agent & Developer Guidelines (CLAUDE.md)](CLAUDE.md) · [Previous](CLAUDE.md)

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
