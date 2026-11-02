---
nodeid: mobile.packages.core.claude
parentnode: mobile.packages.core
childnodes:
  - mobile.packages.core.claude.part-2
codeanchors:
  - frontend/mobile/packages/core/lib/
---

# CLAUDE.md — `packages/core`

Scoped rules for this package. Inherits everything in
[`../../CLAUDE.md`](../../CLAUDE.md); this file adds and narrows.
Inventory and API surface: [`AGENTS.md`](./AGENTS.md).

---

## 1. What this package is for

The single source of infrastructure for every Dorak app: HTTP, environment
config, device storage, session lifecycle, wire models, exceptions.

It is **pure Dart + Flutter foundation**. It contains no UI, no screens, no
localized strings.

## 2. Dependency ceiling

Permitted: third-party packages, and `localization` if a genuine need arises
(currently **not** depended on — keep it that way unless a task requires it).

Forbidden, without exception:

- `design_system` — core must never know about colours, typography or widgets.
- Any feature package.
- **Any `apps/*` import.** If core needs something from an app, the design is
  wrong: invert it with a callback or an abstract contract.

Current third-party set: `bloc`, `dio`, `equatable`, `flutter_dotenv`,
`json_annotation`, `flutter_secure_storage`, `shared_preferences`. Adding
another needs a reason recorded in this file or in `docs/`.

`bloc` is **pure Dart** and is permitted here by
[ADR 0001](../../docs/architecture/decisions/0001-bloc-in-core.md).
`flutter_bloc` and `go_router` are **not** — the Flutter bindings and all
routing stay in the app layer.

## 3. Allowed file roles here

`.client.dart` · `.interceptor.dart` · `.exception.dart` · `.dto.dart` ·
`.entity.dart` · `.endpoints.dart` · `.repository.dart` · `.bloc.dart` ·
`.event.dart` · `.state.dart` · `.provider.dart` · `.storage.dart` ·
`.barrel.dart`

`.storage.dart` is **exclusive to this package** — the taxonomy checker rejects
it anywhere else. `.screen.dart`, `.token.dart` and `.theme.dart` are rejected
here.

## Continued in

- [Part 2: 4. Hard rules](claude-part-2.md)
