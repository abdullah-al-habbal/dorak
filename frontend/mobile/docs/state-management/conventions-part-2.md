---
nodeid: mobile.state-management.conventions.part-2
parentnode: mobile.state-management.conventions
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 2 of 5 · [State Management Conventions](conventions.md) · [Previous](conventions.md) · [Next](conventions-part-3.md)

`Locale` implements value equality in the Flutter SDK
(`platform_dispatcher.dart`, comparing `languageCode`, `scriptCode`,
`countryCode`), so bloc's duplicate-emission suppression works and setting the
locale already in effect emits nothing — covered by
`apps/client_app/test/locale_bloc_test.dart`.

**Conversion trigger.** Introduce `LocaleState` the moment a second real state
field is needed — persisted-versus-system locale, a loading flag, or another
genuine responsibility. Not before. The change is safe to defer:
`BlocBuilder<LocaleBloc, Locale>` names the type explicitly, so introducing a
state class is a compile error at every call site, never a silent break.

## 2. Events

6. Events extend `Equatable`; `props` lists every field.
7. Naming: **past-tense fact** for something that happened
   (`UnauthorizedDetected`); **`…Requested`** for user or system intent
   (`LoginRequested`, `LoadMoreRequested`). Never `SetX` / `UpdateX` — those
   name a mutation, not an event.
8. Events carry data only. Never a callback, never a `BuildContext`.
9. One-shot signals are cleared by an explicit acknowledgement event
   (`SignalAcknowledged`, `AuthSignalAcknowledged`), never implicitly on the
   next emission.

## 3. State

10. **One flat `Equatable` class per bloc.** No sealed status hierarchy — it
    forces exhaustive switches in widgets and makes partial updates verbose.
    Loading is a field, not a subclass.
11. Every state has a `const` default constructor usable as the initial state.
12. **`copyWith` exposes an explicit `clearX` flag for every nullable field.**
    `field ?? this.field` makes `null` unsettable. This is not theoretical:
    `SessionState.copyWith(client: null)` was a silent no-op and left an expired
    user cached in state. Current flags: `clearError`, `clearClient`,
    `clearConfig`.
13. `props` lists every field. A field missing from `props` is a silent
    stale-render or missed-redirect bug.
14. Derived values are getters, never stored — `isAuthenticated`, `hasMore`,
    `isEmpty`. Collections are frozen at the state boundary (`List.unmodifiable`,
    `Map.unmodifiable`, `Set.unmodifiable`).

## 4. Loading · success · empty · error

15. **`isLoading` means reading. `isSubmitting` means a user-initiated write.**
    Never both for one operation.
16. Initial, loading and empty are three distinct conditions and must be
    distinguishable from state alone.
17. For loading data, success is the absence of `error` plus populated data — not
    a separate flag. **A command (a write) reports success with a one-shot
    signal** (a signal enum value or a completion flag) that the bloc clears when
    the next command starts; the UI never infers it from data. New code follows
    this; existing blocs are not rewritten only for it.
18. **Empty is `success && data.isEmpty`.** Never conflated with initial, and
    never rendered as an error.
19. Errors land in `state.error` as `Object?`. **Blocs never rethrow.**
20. **The UI maps errors to localized strings** — use `ErrorFeedback.from`
    (`packages/feature_error_feedback`). `ApiException.message` can be an
    untranslated key (`core::messages.*`) and is never rendered; only safe
    validation field messages are shown.
