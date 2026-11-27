---
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 4 of 5 · [State Management Conventions](conventions.md) · [Previous](conventions-part-3.md) · [Next](conventions-part-5.md)

## 8. Concurrency and event ordering

29. **Bloc's default event transformer is `concurrent()`.** Events of different
    types always interleave. Events of the *same* type also start concurrently —
    each handler runs synchronously only up to its first `await`, then yields.
30. **A handler that can emit before its first `await` uses a state guard**, and
    must emit first so a same-frame duplicate observes it:

    ```dart
    if (state.results.isBusy) return;
    if (!state.results.hasMore) return;
    emit(state.copyWith(results: state.results.loadingMore())); // before any await
    ```

31. **A handler that must `await` before it can emit uses a synchronous bool
    latch.** Reference: `SessionBloc._expiring`, which is what collapses a burst
    of 401s into exactly one expiration.
32. **Cancellation semantics use `bloc_concurrency.restartable()`.** The package
    is deliberately **not yet a dependency** — it is added with its first real
    consumer, expected to be the Discovery feed's search field (Stitch 016).
    Until then, **do not hand-roll a generation counter to fake cancellation.**
    Surface the need instead.
33. Cross-bloc coordination goes through the app layer, keyed on a **signal**,
    never on incidental state. Reference:
    `apps/client_app/lib/src/core/session/auth_coordination.entity.dart`, which
    fires on `AuthSignal.loginSucceeded | registrationSucceeded` — an earlier
    version keyed on `client != null` and re-authenticated an expired session.
    **No bloc-to-bloc `add()`.**
34. Where two listeners observe one bloc, subscription order is the contract and
    must be stated. `DorakApp.initState` subscribes the session coordinator
    before constructing `AppRouter`, so the session updates before the router
    navigates.

### Known gap

`OnboardingConfigBloc` can have two loads in flight for different locales if the
user toggles twice inside one round-trip; the later response wins regardless of
order. This is the concrete case rule 32 defers — it is fixed by
`restartable()`, not by a hand-rolled counter.

## 9. Async operations and repository boundaries

35. `UI → Bloc → repository → ApiClient → backend`. A bloc never touches `Dio`
    or a storage key directly; a widget never touches a repository.
36. Repositories throw typed exceptions — `ApiException`, `ValidationException`,
    `NetworkException`. **Transport types never reach the UI.** The single
    deliberate leak is `NetworkException.type`; do not widen it.
37. Repositories are stateless. Caching and session state belong to a bloc or a
    storage contract.
38. Exactly one component writes a given storage key.
39. A private `_run` helper is the idiom for
    `emit(busy) → action → emit(result | error)`. See `AuthBloc._run`.
