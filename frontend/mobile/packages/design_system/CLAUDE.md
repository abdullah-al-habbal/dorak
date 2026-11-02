---
nodeid: mobile.packages.design-system.claude
parentnode: mobile.packages.design-system
childnodes:
  - mobile.packages.design-system.claude.part-2
codeanchors:
  - frontend/mobile/packages/design_system/lib/
---

# CLAUDE.md — `packages/design_system`

Scoped rules for this package. Inherits [`../../CLAUDE.md`](../../CLAUDE.md).
Inventory and API surface: [`AGENTS.md`](./AGENTS.md).

---

## 1. What this package is for

Visual foundation shared by all three apps: design tokens, `ThemeData`
construction, bundled fonts, and cross-app widgets.

It is the **only** place raw colour, type and dimension values may exist.

## 2. Dependency ceiling

> **`go_router` exception.** `BottomSheetModal` calls `context.pop()`, so this
> package depends on `go_router` by
> [ADR 0002](../../docs/architecture/decisions/0002-design-system-go-router.md).
> **Any consumer must provide a `GoRouter` ancestor**, or pass an explicit
> `onDismiss`. This covers `go_router` and nothing else — any further
> application-layer dependency needs a new ADR.

Permitted: `flutter` and third-party packages only. Currently: `go_router`
(routing-only — used solely for `context.pop()` in `BottomSheetModal`).

Forbidden, without exception:

- **`localization`.** This is the load-bearing constraint of the package. A
  shared widget must never resolve a string; it receives every user-visible
  string as a constructor parameter. `OnboardingHeader(brandLabel:, skipLabel:,
  localeLabel:)` is the pattern.
- **`core`.** No networking, no DTOs, no session, no storage.
- **Any `apps/*` import.**

## 3. Allowed file roles here

`.token.dart` · `.theme.dart` · `.widget.dart` · `.barrel.dart`

`.token.dart` and `.theme.dart` are **exclusive to this package** — the
taxonomy checker rejects them anywhere else. `.screen.dart`, `.dto.dart`,
`.entity.dart`, `.repository.dart` and `.endpoints.dart` are
all rejected here.

## Continued in

- [Part 2: 4. Hard rules](claude-part-2.md)
