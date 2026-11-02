---
nodeid: mobile.state-management.async-state.part-3
parentnode: mobile.state-management.async-state
childnodes: []
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 3 of 3 · [Async State](async-state.md) · [Previous](async-state-part-2.md)

## Retry

Retry re-dispatches the **same event**. There is no `RetryRequested`.

The trap is a guard that also blocks the retry. `OnboardingConfigBloc` had it:
it assigned `localeCode` before fetching, then compared against it, so a failed
load could never be retried for that locale. The guard must distinguish
"a request for this input is already in flight or already succeeded" from
"a request for this input failed":

```dart
final sameLocale = state.localeCode == event.localeCode;
final alreadyLoaded = state.config != null && state.error == null;
if (sameLocale && (state.isLoading || alreadyLoaded)) return;
```

Covered by `apps/client_app/test/onboarding_config_bloc_test.dart`.

## Paginated async state

A paginated surface has more conditions than the five above — first-load versus
next-page versus refresh, each with its own loading and failure rendering. That
is what `Paged<T>` encodes; see [`pagination.md`](./pagination.md).

## Verification

```bash
cd frontend/mobile
dart run melos run test
```
