---
codeanchors:
  - backend/modules/
---

Part 2 of 4 · [Query Builder, Set-Based Persistence, and Raw SQL](query-builder-and-sql.md) · [Previous](query-builder-and-sql.md) · [Next](query-builder-and-sql-part-3.md)

## Set-based persistence

### `upsert()` instead of select-then-branch

Avoid:

```php
$existing = DB::table('prices')->where('sku', $sku)->first();

if ($existing) {
    DB::table('prices')->where('id', $existing->id)->update($data);
} else {
    DB::table('prices')->insert($data);
}
```

Prefer:

```php
DB::table('prices')->upsert([$data], ['sku'], ['price', 'updated_at']);
```

Requires a unique index on the conflict columns. Uniqueness is a database concern, not an
application one.

### `updateOrInsert()` for a single conditional row

```php
DB::table('clients')->updateOrInsert(
    ['email' => $email],
    ['name' => $name],
);
```

Do not `exists()` then branch unless the two paths have genuinely different business
behaviour.

### `insertOrIgnore()` — only when ignoring errors is the intent

Not a generic performance swap for `insert()`. Depending on the driver it can swallow more
than duplicate-key errors (type coercion, strict-mode violations). This repo uses it in
seeders, which is a fair use. Outside seeders, document why ignoring errors is safe.

### `insertUsing()` for data that already lives in the database

```php
DB::table('archived_bookings')->insertUsing(
    ['id', 'client_id', 'created_at'],
    DB::table('bookings')->select('id', 'client_id', 'created_at')->where('status', 'expired'),
);
```

Never pull thousands of rows into PHP just to write them back.

---
