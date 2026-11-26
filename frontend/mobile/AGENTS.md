---
nodeid: mobile.guide
parentnode: repo.root
childnodes:
  - mobile.apps.business-app
  - mobile.apps.client-app
  - mobile.apps.stylist-app
  - mobile.claude
  - mobile.docs
  - mobile.packages.core
  - mobile.packages.design-system
  - mobile.packages.feature-error-feedback
  - mobile.packages.localization
  - mobile.references.codegen-policy
  - mobile.references.commands
  - mobile.references.dependency-layering
  - mobile.references.file-taxonomy
  - mobile.references.root.backend-contract
  - mobile.references.root.commands
  - mobile.references.root.core-architecture
  - mobile.references.root.decisions
  - mobile.references.root.design-system
  - mobile.references.root.feature-inventory
  - mobile.references.root.file-taxonomy
  - mobile.references.root.known-limitations
  - mobile.references.root.localization
  - mobile.references.root.non-negotiable-rules
  - mobile.references.root.per-unit-docs
  - mobile.references.root.repository-shape
  - mobile.references.root.testing-conventions
  - mobile.references.root.where-new-code-goes
  - mobile.references.state-and-navigation
  - mobile.references.type-safety
  - mobile.guide.part-2
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

## Continued in

- [Part 2: More](agents-part-2.md)
