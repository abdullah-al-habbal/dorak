---
nodeid: skills.backend.laravel-native-abstractions.references.exceptions-and-checklist
parentnode: skills.backend.laravel-native-abstractions
childnodes:
  - skills.backend.laravel-native-abstractions.references.exceptions-and-checklist.part-2
codeanchors:
  - backend/modules/
---

Referenced from [`../SKILL.md`](../SKILL.md).

## What not to abstract

Framework-native does not mean "always use a facade" or "never write a service".
Do **not** force a Laravel abstraction when:

- Laravel has no semantic API for the requirement.
- Raw SQL is required for an engine-specific feature Laravel does not represent cleanly
  (e.g. the Haversine distance in `modules/Explore/Eloquent/Resolvers/Shared/ExploreBarbersEloquentResolver.php`).
- The rule is business-specific and does not belong in a generic framework primitive.
- A Handler adds real domain orchestration rather than reproducing framework plumbing.
- The helper would hide an important security, consistency, or performance property.
- The configured infrastructure does not support it (cache tags on the `database` store).


## Allowed exceptions

Low-level code is allowed when it is demonstrably better for correctness, performance, or a
required database / external-system feature. Every exception must:

1. Be local and minimal.
2. Carry a short comment stating why the Laravel semantic API is insufficient.
3. Use parameter binding for SQL — never string interpolation of user input.
4. Preserve transaction, authorization, validation, and observability requirements.
5. Include focused tests.

Real example — `modules/Explore/Eloquent/Resolvers/Shared/ExploreBarbersEloquentResolver.php`
computes Haversine distance in SQL because Eloquent has no predicate for spherical geometry,
then wraps it with `fromSub()` so `distance` is filterable and sortable. That raw fragment is
justified. Its one weakness is that it interpolates coordinates via `sprintf('%f', ...)`
instead of binding them; `%f` coercion makes it safe in practice, but new raw SQL should bind:

```php
// MySQL spatial maths: Haversine distance has no Eloquent predicate equivalent.
$subQuery = BarberModel::query()
    ->select('barbers.*')
    ->selectRaw(
        '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) '
        . '* cos(radians(longitude) - radians(?)) '
        . '+ sin(radians(?)) * sin(radians(latitude)))) AS distance',
        [$latitude, $longitude, $latitude],
    )
    ->whereNotNull('latitude')
    ->whereNotNull('longitude');

$barbers = BarberModel::query()
    ->fromSub($subQuery, 'barbers_sub')
    ->where('distance', '<', $radiusKm)
    ->orderBy('distance')
    ->paginate($perPage);
```

## Continued in

- [Part 2: Agent checklist](exceptions-and-checklist-part-2.md)
