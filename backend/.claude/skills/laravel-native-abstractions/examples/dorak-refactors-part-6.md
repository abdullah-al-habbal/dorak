---
nodeid: skills.backend.laravel-native-abstractions.examples.dorak-refactors.part-6
parentnode: skills.backend.laravel-native-abstractions.examples.dorak-refactors
childnodes: []
codeanchors:
  - backend/modules/
---

Part 6 of 6 · [Worked Refactors From This Codebase](dorak-refactors.md) · [Previous](dorak-refactors-part-5.md)

## 5. Justified raw SQL — leave it, but bind

`modules/Explore/Eloquent/Resolvers/Shared/ExploreBarbersEloquentResolver.php:24`

Haversine distance has no Eloquent predicate, and wrapping it in `fromSub()` so `distance`
becomes filterable and sortable is exactly the right move. This is a **correct** exception to
the rules, not a violation.

The one improvement: coordinates go in through `sprintf('%f', ...)` rather than bindings.
`%f` coercion makes it safe today, but it is a pattern the next author will copy with a string
value. New raw SQL binds:

```php
->selectRaw(
    '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) '
    . '* cos(radians(longitude) - radians(?)) '
    . '+ sin(radians(?)) * sin(radians(latitude)))) AS distance',
    [$payload->latitude, $payload->longitude, $payload->latitude],
)
```

---

## 6. Not every column pair is a morph

Same file, further down:

```php
$edgeWeights = RecommendationEdgeModel::where('source_type', 'client')
    ->where('source_id', $payload->clientId)
    ->where('target_type', 'barber')
    ->whereIn('target_id', $barberIds)
    ->pluck('weight', 'target_id');
```

This *looks* like the `whereMorphedTo()` case from
`references/eloquent-relationships.md`, but it is not: `source_type` and `target_type` hold
domain strings (`'client'`, `'barber'`), not morph class names or morph-map aliases.
`whereMorphedTo()` would resolve `$model->getMorphClass()` and match nothing.

Two honest options — pick based on whether these really are polymorphic references:

1. They are morphs: register a morph map (`'client' => ClientModel::class`), declare
   `source()` / `target()` as `MorphTo`, then `whereMorphedTo()` applies.
2. They are not morphs, just typed edge endpoints: keep the explicit `where` clauses and move
   them into a named query scope (`scopeBetween(...)`) so the four-clause pattern is written
   once.

This is the guard rail in practice: match the API to the data model, not to the shape of the
code. Reaching for `whereMorphedTo()` here would be a fashionable, silently-wrong change.
