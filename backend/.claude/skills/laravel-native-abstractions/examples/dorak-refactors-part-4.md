---
codeanchors:
  - backend/modules/
---

Part 4 of 6 · [Worked Refactors From This Codebase](dorak-refactors.md) · [Previous](dorak-refactors-part-3.md) · [Next](dorak-refactors-part-5.md)

`wasRecentlyCreated` distinguishes the two outcomes without a second query.
`firstOrCreate()` alone is still not race-proof — the index is what makes it safe, and
`UniqueConstraintViolationException` is the path to handle if you keep the explicit branch.

`modules/BarberAffiliation/Eloquent/Resolvers/Barber/CreateAffiliationEloquentResolver.php:18`
has the same shape (`exists()` → `create()`), also with no unique index on
`barber_affiliations`. It additionally assigns the morph columns by hand:

```php
// Before
BarberAffiliationModel::create([
    'barber_id' => $barber->id,
    'affiliable_id' => $command->affiliableId,
    'affiliable_type' => $command->affiliableType,
    // ...
]);
```

`BarberAffiliationModel` declares `barber(): BelongsTo` and `affiliable(): MorphTo`
(`:47`, `:52`), so the child side already has the relationships. `BarberModel` has no
`affiliations()` relation yet (it declares `activationLogs`, `bans`, `services`, `reviews`,
`bookings`), so declare the inverse first:

```php
// BarberModel
public function affiliations(): HasMany
{
    return $this->hasMany(BarberAffiliationModel::class, 'barber_id');
}
```

Then the relationship API can own both sides, including the morph:

```php
// After
$affiliation = $barber->affiliations()->make([
    'commission_rate' => $command->commissionRate,
    'status' => AffiliationStatus::Pending,
    'invited_at' => now(),
]);

$affiliation->affiliable()->associate($affiliable);
$affiliation->save();
```

`associate()` sets both `affiliable_id` and `affiliable_type` from the model's morph class —
no hand-assigned type string, and no drift if a morph map is added later. The existence check
becomes `->whereBelongsTo($barber)`.

Note this requires the `$affiliable` **model**, not the raw `affiliableId` /
`affiliableType` strings the Command currently carries. If resolving that model is not
worthwhile here, keep the explicit columns — passing an id and a type string into
`associate()` is not possible, and faking it defeats the point.

---
