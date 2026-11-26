---
nodeid: mobile.state-management.async-state.part-2
parentnode: mobile.state-management.async-state
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 2 of 3 · [Async State](async-state.md) · [Previous](async-state.md) · [Next](async-state-part-3.md)

## The `_run` idiom

Mutating handlers follow one shape. `AuthBloc._run` is the reference:

```
emit(busy: true, clearError: true, signal: none)
  → await action()
  → success: emit(result, busy: false, signal: <one-shot>)
  → failure: emit(busy: false, error: e, signal: none)
```

Two properties matter:

- **`clearError: true` on entry.** A retry must not render the previous
  failure while it is in flight.
- **The bloc does not rethrow.** The error is state. Screens read
  `state.error` and map it — see rule 20 in `conventions.md`.

## Error mapping is the UI's job

A backend `message` is an untranslated key (`core::messages.invalid_credentials`
arrives literally). Blocs store the raw exception; the screen converts:

```dart
final error = state.error == null
    ? null
    : ErrorFeedback.from(state.error!, l10n,
        unauthorizedMessage: l10n.loginErrorInvalidCredentials);
```

`ErrorFeedback.from` (`packages/feature_error_feedback`) handles every failure.
The rules, including which server field messages may be shown, are in
[the authentication flow](../authentication/auth-flow-part-2.md). For a failed
load use `ErrorFeedback.loadMessage`; for a failed action shown in place use
`InlineError`. Branch on `ApiFailureKind` (`core`) when behaviour, not wording,
depends on the kind of failure.