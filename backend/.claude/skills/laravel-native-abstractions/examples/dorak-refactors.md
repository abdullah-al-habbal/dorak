---
nodeid: skills.backend.laravel-native-abstractions.examples.dorak-refactors
parentnode: skills.backend.laravel-native-abstractions
childnodes:
  - skills.backend.laravel-native-abstractions.examples.dorak-refactors.part-2
  - skills.backend.laravel-native-abstractions.examples.dorak-refactors.part-3
  - skills.backend.laravel-native-abstractions.examples.dorak-refactors.part-4
  - skills.backend.laravel-native-abstractions.examples.dorak-refactors.part-5
  - skills.backend.laravel-native-abstractions.examples.dorak-refactors.part-6
codeanchors:
  - backend/modules/
---

# Worked Refactors From This Codebase

Real cases found in `modules/` on 2026-08-22, with the framework-native alternative. File
paths are accurate as of that date; verify before editing.

These are **illustrations of the rules**, not a work order. Do not refactor a file you are not
otherwise touching.

---

## 1. Foreign-key duplication → `whereBelongsTo()`

`modules/Currency/Eloquent/Resolvers/Shared/ConvertCurrencyEloquentResolver.php:29`

```php
// Before
$rate = ExchangeRateModel::where('from_currency_id', $fromCurrency->id)
    ->where('to_currency_id', $toCurrency->id)
    ->first();
```

```php
// After — requires fromCurrency()/toCurrency() belongsTo relations on ExchangeRateModel
$rate = ExchangeRateModel::query()
    ->whereBelongsTo($fromCurrency, 'fromCurrency')
    ->whereBelongsTo($toCurrency, 'toCurrency')
    ->first();
```

The relationship name is mandatory here: two relations point at the same model, so Eloquent
cannot infer which foreign key you mean. If those relations do not exist yet, **declare them
first** — `whereBelongsTo()` on an undeclared relation throws
`RelationNotFoundException`.

---

## Continued in

- [Part 2: 2. Route-scoped lookup → scoped binding (and a missing polic](dorak-refactors-part-2.md)
- [Part 3: 3. Exists-then-create race → firstOrCreate() + a unique inde](dorak-refactors-part-3.md)
- [Part 4: continued](dorak-refactors-part-4.md)
- [Part 5: 4. Repeated query in one execution → relationship + load onc](dorak-refactors-part-5.md)
- [Part 6: 5. Justified raw SQL — leave it, but bind](dorak-refactors-part-6.md)
