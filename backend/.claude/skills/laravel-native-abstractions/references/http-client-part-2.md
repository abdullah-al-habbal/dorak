---
nodeid: skills.backend.laravel-native-abstractions.references.http-client.part-2
parentnode: skills.backend.laravel-native-abstractions.references.http-client
childnodes: []
codeanchors:
  - backend/modules/
---

Part 2 of 3 · [HTTP Client](http-client.md) · [Previous](http-client.md) · [Next](http-client-part-3.md)

---

## Retry policy

Do not retry blindly.

- Retry transient failures only: connection errors, timeouts, `429`, `502`, `503`, `504`.
- Never auto-retry a non-idempotent write without an idempotency key. See
  `docs/13-technical-concepts.md` for this repo's idempotency-key convention.
- Use the `$when` callback to scope retries:

```php
->retry(3, 200, fn (Throwable $e) => $e instanceof ConnectionException, throw: false)
```

- Pass an array for a backoff schedule: `->retry([100, 500, 2000])`.
- A hand-written `for ($attempt = 0; ...)` loop around an HTTP call is a defect unless the
  policy genuinely exceeds what `retry()` can express.

---

## Parallel requests

```php
$responses = Http::pool(fn (Pool $pool) => [
    $pool->as('branches')->get("{$base}/branches"),
    $pool->as('services')->get("{$base}/services"),
]);

$branches = $responses['branches']->json();
```

Use `pool()` for independent requests. Do not pool dependent calls, and do not pool a request
whose result decides whether the next one should be made at all.

For non-HTTP parallel work see `references/concurrency-collections-helpers.md`.

---
