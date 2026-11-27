---
codeanchors:
  - frontend/mobile/packages/core/lib/
---

Part 3 of 5 · [State Management Conventions](conventions.md) · [Previous](conventions-part-2.md) · [Next](conventions-part-4.md)

## 5. Retry

21. **Retry re-dispatches the same event.** There is no `RetryRequested`.
22. **A guard that prevents a duplicate in-flight request must not prevent a
    retry after failure.** `OnboardingConfigBloc` violated this — it assigned
    `localeCode` before fetching and then compared against it, so a failed load
    could never be retried for that locale. The guard now also requires either
    an in-flight load or an already-successful one.
23. Retry preserves surrounding state — filters, query, loaded items.

## 6. Refresh

24. Refresh reloads from the first page **while keeping current data visible**,
    so the screen never flashes empty.
25. Refresh is distinguishable from first-load and from load-more in state — see
    `PageTrigger` in [`pagination.md`](./pagination.md).
26. A failed refresh keeps the existing list. It is a transient notification,
    not a full-screen error.

## 7. Pagination

27. The contract is `Paged<T>` in `packages/core`. Full specification in
    [`pagination.md`](./pagination.md).
28. **There is no generic `PaginationBloc<T>`** and none should be added. Bloc
    dispatches on event *type*, so generic events work badly, and every real feed
    carries more than a list. Feature blocs hold a `Paged<T>` as a field.
