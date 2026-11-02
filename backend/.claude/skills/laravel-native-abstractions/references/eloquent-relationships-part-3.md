---
nodeid: skills.backend.laravel-native-abstractions.references.eloquent-relationships.part-3
parentnode: skills.backend.laravel-native-abstractions.references.eloquent-relationships
childnodes: []
codeanchors:
  - backend/modules/
---

Part 3 of 7 · [Eloquent: Relationship-Aware Queries](eloquent-relationships.md) · [Previous](eloquent-relationships-part-2.md) · [Next](eloquent-relationships-part-4.md)

## `whereAttachedTo()` — many-to-many

Avoid rebuilding pivot joins or `whereIn()` subqueries when a `belongsToMany` relationship
already exists.

```php
$users = UserModel::query()
    ->whereAttachedTo($role)
    ->get();
```

Pass the relationship name when ambiguous: `whereAttachedTo($role, 'assignedRoles')`.

---

## `whereMorphedTo()` — polymorphic

Avoid:

```php
$comments = CommentModel::query()
    ->where('commentable_type', $post->getMorphClass())
    ->where('commentable_id', $post->getKey())
    ->get();
```

Prefer:

```php
$comments = CommentModel::query()
    ->whereMorphedTo('commentable', $post)
    ->get();
```

Do not reproduce morph-map/type resolution manually — Eloquent already owns it. Related:
`whereNotMorphedTo()`, `whereMorphRelation()`, `whereHasMorph()`.

This repo has three polymorphic links (see `laravel-migrations-baseline`); e.g.
`modules/Branch/Http/Actions/Branch/ListAffiliationsAction.php` filters
`affiliable_id` manually and is a candidate for `whereMorphedTo()`.

---
