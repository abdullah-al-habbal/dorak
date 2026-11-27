---
codeanchors:
  - backend/modules/
---

Part 4 of 4 · [Concurrency, Deferral, Collections, Helpers](concurrency-collections-helpers.md) · [Previous](concurrency-collections-helpers-part-3.md)

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
