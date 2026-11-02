---
nodeid: skills.backend.laravel-native-abstractions.references.exceptions-and-checklist.part-2
parentnode: skills.backend.laravel-native-abstractions.references.exceptions-and-checklist
childnodes: []
codeanchors:
  - backend/modules/
---

Part 2 of 2 · [exceptions and checklist](exceptions-and-checklist.md) · [Previous](exceptions-and-checklist.md)

## Agent checklist

Before finalizing Laravel code:

- [ ] Is there an existing Action, Handler, Resolver, model scope, relationship, Resource, event, or job I should use instead?
- [ ] Did I use a relationship instead of duplicating a foreign key?
- [ ] Did I eager load exactly what will be accessed or serialized — nothing more?
- [ ] Did I check the query count for N+1 (strict mode is off in this repo)?
- [ ] Did I pick the right cardinality method: `first`, `firstOrFail`, `sole`, `exists`, `value`, `valueOrFail`, `count`, `pluck`?
- [ ] Does concurrent data need a transaction, a unique index, a cache lock — or all three?
- [ ] Does queued work need `afterCommit()` / `ShouldQueueAfterCommit`?
- [ ] Did I avoid `Cache::tags()` (unsupported by this repo's `database` store)?
- [ ] Did I use the framework's HTTP / cache / filesystem / validation / queue / testing APIs instead of reimplementing them?
- [ ] Is every raw SQL fragment bound, commented, and justified?
- [ ] Did I run `vendor/bin/pint` and the tests required by `testing/SKILL.md`?
