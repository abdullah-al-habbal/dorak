---
nodeid: mobile.references.type-safety
parentnode: mobile.guide
childnodes: []
codeanchors:
  - frontend/mobile/apps/
  - frontend/mobile/packages/
---

Referenced from [`../CLAUDE.md`](../CLAUDE.md).

## 3c. Type Safety & Quality Governance

- Avoid `dynamic` wherever a concrete type is known or inferable — DTOs/entities already use
  typed, codegen'd fields (§4b); don't widen a field to `dynamic` to sidestep a cast.
- Every public method and top-level function declares an explicit return type.
- Keep `build()` methods lean: extract a section into a private `.widget.dart` once it stops
  being a single visual concern, rather than growing one `build()` indefinitely. Business
  logic (branching, formatting, derived values) belongs in the Bloc/Cubit or a
  `.util.dart`/entity method, not inline in a widget's `build()`.
- No magic strings/numbers for statuses or thresholds — use an enum (`.entity.dart`) or a
  named constant, consistent with `12StrictEnums` on the backend side.
- Every user-facing string goes through `app_en.arb` + `app_ar.arb` (§11 in `AGENTS.md`) —
  never a hardcoded literal in a `.screen.dart`/`.widget.dart`.
- Add a widget or bloc test for new/changed behavior before considering a change done;
  `melos run verify` (which runs `melos run test`) is the gate, not a manual check.
- Prefer an early return / guard clause over nested `if/else` — exit at the top of a method
  for the invalid/edge case, then let the happy path run unindented.
