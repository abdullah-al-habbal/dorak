---
nodeid: mobile.docs.part-2
parentnode: mobile.docs
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Part 2 of 13 · [Dorak Mobile — AI Execution Index](index.md) · [Previous](index.md) · [Next](index-part-3.md)

Repository: `dorak-mobile`
Architecture contract: `/CLAUDE.md`
Visual source of truth: Stitch Project `9427872355342200736`
Documentation root: `/docs`

## 1. Purpose

This directory is the implementation contract for the Dorak Flutter monorepo.

Documentation is divided into two categories:

1. Engineering documentation — architecture, runtime behavior, state management, networking, storage, security, testing, and AI-agent execution rules.
2. Design documentation — normalized design tokens, reusable components, application states, flows, and screen specifications derived from Stitch.

Stitch defines the visual design.

The engineering documentation defines how that design must be implemented.

The two sources must remain separate and must not silently replace each other.

---

## 2. AI Agent Execution Protocol

Before modifying code, an AI agent MUST:

0. Read `/AGENTS.md` — the entry point (feature inventory, backend contract,
   non-obvious decisions, testing conventions).
1. Read `/CLAUDE.md`.
2. Read this file.
3. Identify the current Track and Task.
4. Read only the documentation required by the current Track.
5. Inspect the existing implementation before creating new files.
6. Preserve package and dependency boundaries.
7. Follow the repository file-naming taxonomy.
8. Implement only the current Task.
9. Run the required verification commands.
10. Update relevant documentation and status before advancing.

An AI agent MUST NOT:

* Skip required architectural documentation.
* Invent undocumented backend APIs or contracts.
* Duplicate existing components or infrastructure.
* Introduce a second networking architecture.
* Introduce a second state-management architecture.
* Put business logic inside design-system components.
* Import application code into shared packages.
* Implement future Tracks prematurely.
* Mark work complete without verification.

---
