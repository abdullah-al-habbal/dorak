---
nodeid: skills.backend.laravel-native-abstractions.references.repo-facts
parentnode: skills.backend.laravel-native-abstractions
childnodes: []
codeanchors:
  - backend/modules/
---

Referenced from [`../SKILL.md`](../SKILL.md).

## Repo-specific facts you must not get wrong

Verified in this repo on 2026-08-22. These override generic Laravel advice.

**Cache tags will throw here.** `CACHE_STORE=database` in both `.env` and `.env.testing`.
`Illuminate\Cache\DatabaseStore` does not extend `TaggableStore`, so `Cache::tags(...)`
raises `BadMethodCallException: This cache store does not support tagging.` Only the `apc`,
`array`, `memcached`, `null`, `failover`, and `redis` stores are taggable in 13.20.
Design cache invalidation with explicit keys or a key-prefix/version scheme instead.
`Cache::lock()` **is** available — `DatabaseStore` implements `LockProvider`.

**There is no authorization layer yet.** Repo-wide there are zero `*Policy.php` classes, zero
`Gate::` calls, zero `abort(403)` calls, and no `role:` / `permission:` middleware — despite
`spatie/laravel-permission` being installed. Ownership is currently enforced by scoping the
query, e.g. `JobPostingModel::where('branch_id', $branch->id)->findOrFail($jobPosting)`.
A scoped query is **not** authorization. When you touch one of these paths, read
`references/requests-validation-authorization.md` and introduce a policy rather than copying
the scoping pattern into a new file.

**Strict Eloquent is not enabled.** No `shouldBeStrict()`, `preventLazyLoading()`,
`preventSilentlyDiscardingAttributes()`, or `preventAccessingMissingAttributes()` call exists
in the repo, so N+1 queries and typo'd attributes fail silently today. Do not rely on strict
mode catching your mistake — inspect query counts yourself.

**~44 files duplicate a foreign key** with `where('*_id', $model->id)`. This is the single
highest-volume smell in the codebase. See `examples/dorak-refactors.md` for the real
before/after cases.

**Commands.** `composer test` (config:clear + Pest against MySQL `dorak_test`) and
`vendor/bin/pint --test` — both are what the Husky pre-push hook runs.

**Resolvers live in two places.** 19 `modules/*/Eloquent/Resolvers/` directories (the
convention) plus 17 legacy `modules/Barber/Repositories/*EloquentResolver.php` files. New
code goes in `Eloquent/Resolvers/`.
