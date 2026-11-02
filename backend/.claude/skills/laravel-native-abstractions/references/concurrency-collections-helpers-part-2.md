---
nodeid: skills.backend.laravel-native-abstractions.references.concurrency-collections-helpers.part-2
parentnode: skills.backend.laravel-native-abstractions.references.concurrency-collections-helpers
childnodes: []
codeanchors:
  - backend/modules/
---

Part 2 of 4 · [Concurrency, Deferral, Collections, Helpers](concurrency-collections-helpers.md) · [Previous](concurrency-collections-helpers.md) · [Next](concurrency-collections-helpers-part-3.md)

## Deferred work

When a result is not needed before the response is sent:

```php
defer(fn () => $this->metrics->reportBooking($booking));

Concurrency::defer([
    fn () => $metrics->reportClients(),
    fn () => $metrics->reportBranches(),
]);
```

`defer()` (verified in `Foundation/helpers.php:444`) runs after the response is sent, in the
same process. Signature: `defer(?callable $callback = null, ?string $name = null, bool $always = false)`.

| Need | Use |
|---|---|
| Fire-and-forget, cheap, no retry needed | `defer()` |
| Must survive a crash, needs retries/backoff | a queued job |
| Several independent slow tasks, result needed now | `Concurrency::run()` |
| Several independent slow tasks, result not needed | `Concurrency::defer()` |

Deferred callbacks are **not** durable. Anything that must not be lost belongs on the queue.
By default a deferred callback is skipped when the request failed; pass `always: true` to run
it regardless. In tests call `$this->withoutDefer()` (from
`Foundation\Testing\Concerns\InteractsWithContainer`) so deferred callbacks execute
immediately, or invoke them manually with `defer()->invoke()` — `defer()` with no arguments
returns the `DeferredCallbackCollection`.

---
