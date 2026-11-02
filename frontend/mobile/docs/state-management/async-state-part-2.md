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
    : AuthError.from(state.error!, l10n,
        unauthorizedMessage: l10n.loginErrorInvalidCredentials);
```

`AuthError.from` handles `ValidationException` (per-field errors, which *are*
real messages and safe to show), `NetworkException`, and `ApiException` by
status. Anything else falls back to a generic localized string.
