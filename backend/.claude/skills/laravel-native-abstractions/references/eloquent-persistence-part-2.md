---
nodeid: skills.backend.laravel-native-abstractions.references.eloquent-persistence.part-2
parentnode: skills.backend.laravel-native-abstractions.references.eloquent-persistence
childnodes: []
codeanchors:
  - backend/modules/
---

Part 2 of 4 · [Eloquent: Persistence, Cardinality, Bulk Work, Transactions](eloquent-persistence.md) · [Previous](eloquent-persistence.md) · [Next](eloquent-persistence-part-3.md)

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
