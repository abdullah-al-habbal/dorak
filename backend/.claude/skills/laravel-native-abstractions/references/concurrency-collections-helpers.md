# Concurrency, Deferral, Collections, Helpers

---

## Concurrency

```php
[$branchCount, $bookingCount] = Concurrency::run([
    fn (): int => BranchModel::query()->count(),
    fn (): int => BookingModel::query()->count(),
]);
```

Verified: `Concurrency::run(Closure|array $tasks, CarbonInterval|int|null $timeout = null): array`
and `Concurrency::defer(Closure|array $tasks): DeferredCallback`.

**Repo caveat.** There is no `modules/Core/Config/concurrency.php`, and this app loads config
only from that directory (see `AGENTS.md`), so `concurrency.default` is unset and the
framework falls back to the **`process`** driver. That driver serializes each closure and
shells out to `artisan invoke-serialized-closure` — one PHP process per task. Overhead is real:

- Worth it for several genuinely slow, independent operations (external calls, heavy aggregates).
- Not worth it for two cheap `count()` queries — the process spawn costs more than the queries.
- Measure before adopting. If the app ever needs the cheaper `fork` driver, it requires the
  `spatie/fork` package and a config file to select it.

Rules:

- Only for **independent** work. Never parallelize dependent steps or operations sharing
  mutable state.
- Closures are serialized: no unserializable captures (open PDO handles, `$this` bound to a
  big graph), and the child process does not share the parent's transaction.
- Never run database writes that must be transactional across tasks — each task gets its own
  connection and its own transaction.

For parallel HTTP specifically, prefer `Http::pool()` — see `references/http-client.md`.

---

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

## Collections

When the data is already a Collection, use the operator instead of converting to an array and
rebuilding common behaviour.

| Intent | Operator |
|---|---|
| Keep / drop by predicate | `filter()`, `reject()` |
| Filter by key/value | `where()`, `whereIn()`, `whereNotIn()`, `whereNull()`, `whereInstanceOf()` |
| Transform | `map()`, `mapWithKeys()`, `flatMap()`, `mapInto()` |
| Group / index | `groupBy()`, `keyBy()` |
| Split by predicate | `partition()` |
| Deduplicate | `unique()`, `duplicates()` |
| Membership | `contains()`, `containsStrict()`, `containsOneItem()` |
| Retrieve one | `first()`, `firstWhere()`, `sole()`, `last()` |
| Aggregate | `sum()`, `avg()`, `min()`, `max()`, `count()`, `countBy()` |
| Ordering | `sortBy()`, `sortByDesc()`, `sortDesc()`, `sortKeys()` |
| Flow control | `when()`, `unless()`, `tap()`, `pipe()`, `pipeThrough()` |
| Type safety | `ensure(BookingModel::class)` |
| Chunked work | `chunk()`, `chunkWhile()`, `sliding()` |

`sole()` when "exactly one" is a domain invariant — zero and many both throw instead of
silently returning a row.

Do not write a five-line `foreach` for something an operator names. Do not force Collection
APIs onto work that should stay set-based SQL — filtering 10,000 rows in PHP after `get()` is
a defect, not a style choice.

`LazyCollection` (from `lazy()` / `lazyById()` / `cursor()`) supports most of the same
operators without materializing everything.

---

## Helpers

Verified locations: `Illuminate/Foundation/helpers.php`, `Illuminate/Support/helpers.php`,
`Illuminate/Collections/helpers.php`, `Illuminate/Collections/functions.php`.

| Helper | Use |
|---|---|
| `abort_if()` / `abort_unless()` | Guard that ends the request with an HTTP status |
| `throw_if()` / `throw_unless()` | Guard that raises a domain exception |
| `rescue($callback, $default)` | Deliberately recoverable operation; reports and falls back |
| `retry($times, $callback, $sleep, $when)` | Retryable non-HTTP operation |
| `once($callback)` | Memoize a value for the calling scope |
| `blank()` / `filled()` | Presence check that treats `''`, `[]`, whitespace correctly |
| `value($value, ...$args)` | Resolve a value-or-closure |
| `transform($value, $callback, $default)` | Map a value only when it is filled |
| `tap($value, $callback)` | Act on a value and return it |
| `with($value, $callback)` | Pipe a value into a closure |
| `enum_value($enum)` | Scalar from a backed enum or pass-through |
| `defer($callback)` | Post-response work |
| `str()` / `collect()` | Fluent wrappers |

```php
throw_unless($booking->isPending(), BookingNotPendingException::class, $booking->getKey());

$rate = rescue(
    fn (): float => $this->exchangeRateClient->latest($from, $to),
    fn (): float => $this->fallbackRate($from, $to),
);
```

Use a helper only when its name makes the intent clearer. `abort_if($x, 403)` is better than a
three-line `if`; a helper chain that hides an important branch is worse than the branch.

`optional()` is legacy — prefer nullsafe `?->` and null coalescing in new code.
