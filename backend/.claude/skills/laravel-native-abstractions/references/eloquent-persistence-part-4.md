---
nodeid: skills.backend.laravel-native-abstractions.references.eloquent-persistence.part-4
parentnode: skills.backend.laravel-native-abstractions.references.eloquent-persistence
childnodes: []
codeanchors:
  - backend/modules/
---

Part 4 of 4 · [Eloquent: Persistence, Cardinality, Bulk Work, Transactions](eloquent-persistence.md) · [Previous](eloquent-persistence-part-3.md)

## Transactions

Wrap writes that must succeed or fail together:

```php
$result = DB::transaction(function () use ($command): CreateBookingResult {
    $booking = $this->createBooking($command);
    $this->reserveChair($booking);

    return new CreateBookingResult($booking);
});
```

Rules:

- One transaction per unit of data consistency — not one per Handler by reflex.
- Never wrap slow external work in a transaction: HTTP calls, mail delivery, file uploads,
  image processing. Locks are held for the whole block.
- `DB::transaction($cb, $attempts)` retries on deadlock; make the callback idempotent if you
  pass `$attempts > 1`.
- Pessimistic locking when a row must not change under you: `lockForUpdate()` (write intent)
  or `sharedLock()` (read intent). Both require an open transaction.
- A cache lock is not a transaction and a transaction is not a cache lock. They solve
  different problems; concurrency-critical booking paths often need both plus a unique index.

---

## After-commit work

Work dispatched inside an open transaction can start before the data is visible.

```php
DB::transaction(function () use ($command): void {
    $booking = $this->createBooking($command);

    ConfirmBookingJob::dispatch($booking)->afterCommit();
});
```

Options, in order of preference:

1. `->afterCommit()` on the dispatch — explicit, per-dispatch.
2. `implements ShouldQueueAfterCommit` on the job class — the default for that job
   (`Illuminate\Contracts\Queue\ShouldQueueAfterCommit`, verified present in 13.20).
3. `'after_commit' => true` on the queue connection — global default; then use
   `->beforeCommit()` for the rare opt-out.

Applies to jobs, queued events, queued listeners, notifications, mailables, and broadcasts —
anything that reads or acts on data written in the transaction.

Outside a transaction, `afterCommit()` dispatches immediately. It is safe to add
unconditionally in a Handler that may or may not be wrapped later.
