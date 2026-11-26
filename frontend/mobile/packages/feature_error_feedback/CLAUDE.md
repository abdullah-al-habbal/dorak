---
nodeid: mobile.packages.feature-error-feedback.claude
parentnode: mobile.packages.feature-error-feedback
childnodes: []
codeanchors:
  - frontend/mobile/packages/feature_error_feedback/lib/
---

# CLAUDE.md — `packages/feature_error_feedback`

Scoped rules for this package. Inherits [`../../CLAUDE.md`](../../CLAUDE.md).
API: [`AGENTS.md`](./AGENTS.md).

## Dependency ceiling

`core`, `localization`, `design_system` and Flutter only. No app imports, no
state management, no navigation. `dio` is a test-only dev dependency.

## File roles

`.provider.dart` (stateless presentation logic) and `.widget.dart`. The taxonomy
checker rejects `.entity.dart` in `feature_*` packages. One class per file.

## Hard rules

- Never render `ApiException.message`.
- A server string reaches the UI only through `SafeServerMessage`.
- Compare codes through `ApiErrorCodeConstants`, never a literal.
- No wording that is true for only one app.
