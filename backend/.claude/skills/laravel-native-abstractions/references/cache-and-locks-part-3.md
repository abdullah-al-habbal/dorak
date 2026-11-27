---
codeanchors:
  - backend/modules/
---

Part 3 of 4 · [Cache and Locks](cache-and-locks.md) · [Previous](cache-and-locks-part-2.md) · [Next](cache-and-locks-part-4.md)

## Atomic locks

`Cache::lock()` gives cross-process mutual exclusion. Use it instead of hand-coding Redis
`SET NX` with owner tokens, expiry, and cleanup.

```php
$lock = Cache::lock("booking:{$booking->getKey()}:processing", 30);

if (! $lock->get()) {
    throw new BookingAlreadyProcessingException();
}

try {
    $this->processBooking($booking);
} finally {
    $lock->release();
}
```

Blocking form, which releases automatically:

```php
Cache::lock("chair:{$chairId}", 10)->block(5, function (): void {
    // waits up to 5s for the lock, throws LockTimeoutException on failure
});
```

Rules:

- Always set a TTL long enough for the critical section, or a crashed worker holds it forever.
- `->release()` in a `finally`, or use the closure form.
- To release from a different process, pass the owner token: `Cache::restoreLock($name, $owner)->release()`.
- A lock is **not** a transaction and **not** a unique index. For the no-double-booking
  invariant you need the database constraint as well — see `laravel-testing-baseline`.

### Overlap and concurrency limiters

```php
Cache::withoutOverlapping('sync-exchange-rates', function (): void { /* ... */ });

Cache::funnel('call-external-api')->limit(3)->then(fn () => $client->call());
```

`withoutOverlapping()` = "at most one at a time". `funnel()` = "at most N concurrently".
Both are built on the lock driver, so both work with the `database` store.

---
