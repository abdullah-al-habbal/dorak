---
nodeid: mobile.guide
parentnode: repo.root
childnodes:
  - mobile.claude
  - mobile.docs
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

# AGENTS.md — Dorak Mobile

**Read this file before touching anything in `frontend/mobile/`.** It is the single
entry point: architecture, hard rules, what already exists, what does not, and
the decisions that are *not* visible in the code.

The Dart source carries almost no comments by design. Rationale lives here. If
you are about to "clean up" something that looks odd, check §9 first — most of
it is deliberate.

Documentation routes: [mobile documentation](docs/index.md) · [repository graph](../../docs/index.md).

## 1. Read order

| Order | File | Why |
|---|---|---|
| 1 | **`AGENTS.md`** (this file) | the monorepo-wide picture |
| 2 | `CLAUDE.md` | the normative taxonomy + layering contract |
| 3 | **the `AGENTS.md` + `CLAUDE.md` of the unit you are editing** | see §1.1 |
| 4 | `docs/index.md` | Track status and the current execution point |
| 5 | `docs/feature-index.md` | monorepo feature registry |
| 6 | topic docs under `docs/` | only what the current task needs |

## More

| Section | Read |
| --- | --- |
| §1.1 Per-unit docs | [`references/root/per-unit-docs.md`](references/root/per-unit-docs.md) |
| §2 Repository shape | [`references/root/repository-shape.md`](references/root/repository-shape.md) |
| §3 Non-negotiable rules | [`references/root/non-negotiable-rules.md`](references/root/non-negotiable-rules.md) |
| §4 File taxonomy | [`references/root/file-taxonomy.md`](references/root/file-taxonomy.md) |
| §5 Commands | [`references/root/commands.md`](references/root/commands.md) |
| §6 Core architecture (networking, storage, session, navigation, launch gate) | [`references/root/core-architecture.md`](references/root/core-architecture.md) |
| §7 Feature inventory — built / not built | [`references/root/feature-inventory.md`](references/root/feature-inventory.md) |
| §8 Backend contract and its known defects | [`references/root/backend-contract.md`](references/root/backend-contract.md) |
| §9 Decisions that are not in the code | [`references/root/decisions.md`](references/root/decisions.md) |
| §10 Design system — reuse, do not recreate | [`references/root/design-system.md`](references/root/design-system.md) |
| §11 Localization | [`references/root/localization.md`](references/root/localization.md) |
| §12 Testing conventions | [`references/root/testing-conventions.md`](references/root/testing-conventions.md) |
| §13 Known limitations in shipped UI | [`references/root/known-limitations.md`](references/root/known-limitations.md) |
| §14 Where does new code go? | [`references/root/where-new-code-goes.md`](references/root/where-new-code-goes.md) |
