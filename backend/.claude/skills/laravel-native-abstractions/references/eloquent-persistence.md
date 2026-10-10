# Eloquent: Persistence, Cardinality, Bulk Work, Transactions

---

## Semantic persistence methods

Pick the method that names the intent.

| Intent | Method |
|---|---|
| Find it, or create it | `firstOrCreate($attributes, $values)` |
| Find it, or build it unsaved (needs changes before save) | `firstOrNew($attributes, $values)` |
| Find it and update it, otherwise create it | `updateOrCreate($attributes, $values)` |
| Create only if absent, without a select first | `createOrFirst($attributes, $values)` |
| Bulk create-or-update | `upsert($values, $uniqueBy, $update)` |

```php
$setting = SettingModel::query()->firstOrCreate(
    ['key' => 'currency'],
    ['value' => 'SAR'],
);

$setting = SettingModel::query()->firstOrNew(['key' => 'currency']);
$setting->value = 'SAR';
$setting->save();

$preference = ClientPreferenceModel::query()->updateOrCreate(
    ['client_id' => $client->getKey(), 'key' => 'newsletter'],
    ['value' => true],
);
```

`upsert()` signature (verified): `upsert(array $values, $uniqueBy, $update = null)` — named
arguments `uniqueBy:` and `update:` are valid.

```php
BookingProjectionModel::query()->upsert(
    $rows,
    uniqueBy: ['booking_id', 'status'],
    update: ['updated_at', 'metadata'],
);
```

`upsert()` bypasses model events and casts on the written rows. Do not use it when observers
or domain side effects must fire.

---

## Database constraints remain mandatory

`firstOrCreate()`, `createOrFirst()`, `updateOrCreate()`, and `upsert()` are **not**
concurrency guarantees. Two simultaneous requests can both pass the read.

For anything that must be unique, the migration owns the truth:

```php
$table->unique(['client_id', 'key']);
```

The database is the final authority. Application-level find-or-create complements the
constraint; it never replaces it. See `database-conventions` and `laravel-migrations-baseline`.

The same applies to a pre-check with `Rule::unique` — it narrows the race window, it does not
close it. Handle the integrity-violation path: Laravel 13 raises
`Illuminate\Database\UniqueConstraintViolationException` (a `QueryException` subclass), so
catch that rather than string-matching driver error codes.

---

## Single-result intent

Use the method matching the expected cardinality.

| Expected result | Method |
|---|---|
| Zero or one model | `first()` |
| Exactly one, else 404-style failure | `firstOrFail()` / `findOrFail()` |
| Exactly one; duplicates are a data-integrity bug | `sole()` |
| Existence only | `exists()` / `doesntExist()` |
| One scalar | `value('column')` |
| One required scalar | `valueOrFail('column')` |
| Exactly one scalar; duplicates invalid | `soleValue('column')` |
| A flat list | `pluck('column')` / `pluck('name', 'id')` |
| A count | `count()` |

```php
$booking = BookingModel::query()->findOrFail($bookingId);

$affiliation = BarberAffiliationModel::query()
    ->whereBelongsTo($barber)
    ->sole();                            // throws on 0 or 2+

$email = ClientModel::query()
    ->whereKey($clientId)
    ->valueOrFail('email');
```

Avoid:

```php
->get()->first()        // use first()
->get()->count()        // use count()
->get()->isNotEmpty()   // use exists()
->get()->pluck('id')    // use pluck('id')
```

`sole()` throws `MultipleRecordsFoundException` / `RecordsNotFoundException`. Use it where
"exactly one" is a domain invariant, so a data problem fails loudly instead of silently
picking a row.

---

## Bulk and large-data processing

Never load a large result set with `get()` just to loop it.

```php
BookingModel::query()
    ->where('status', BookingStatusEnum::Pending)
    ->lazyById()
    ->each(function (BookingModel $booking): void {
        // one model in memory at a time
    });
```

| Traversal | Use when |
|---|---|
| `chunk($size, $cb)` | Read-only pass, stable ordering, offset paging acceptable |
| `chunkById($size, $cb)` | Rows may be **updated or deleted** during the pass |
| `each($cb)` / `eachById($cb)` | Same as above with a per-model callback |
| `lazy()` | Streaming a `LazyCollection`, read-only |
| `lazyById()` | Streaming while rows mutate |
| `cursor()` | Single query, one hydrated model at a time (no chunking) |

Use the `*ById` variants whenever the loop modifies a column used in the `where` or `order`
clause — offset-based chunking silently skips rows in that case.

Prefer a set-based update when per-model events, casts, and observers are **not** required:

```php
BookingModel::query()
    ->where('status', BookingStatusEnum::Pending)
    ->where('starts_at', '<', now())
    ->update(['status' => BookingStatusEnum::Expired]);
```

A mass `update()` / `delete()` fires no model events. If domain side effects are required,
dispatch an explicit domain operation or process models individually.

`increment()` / `decrement()` / `incrementEach()` push the arithmetic into the database and
avoid read-modify-write races:

```php
BranchModel::query()->whereKey($branchId)->increment('views');
BranchModel::query()->whereKey($branchId)->incrementEach(['views' => 1, 'shares' => 2]);
```

---

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
