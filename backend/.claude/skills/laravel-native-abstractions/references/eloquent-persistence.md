---
codeanchors:
  - backend/modules/
---

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

## Continued in

- [Part 2: Database constraints remain mandatory](eloquent-persistence-part-2.md)
- [Part 3: Bulk and large-data processing](eloquent-persistence-part-3.md)
- [Part 4: Transactions](eloquent-persistence-part-4.md)
