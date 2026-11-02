---
nodeid: backend.16-deployment-operations.part-6
parentnode: backend.16-deployment-operations
childnodes: []
codeanchors:
  - backend/modules/
---

Part 6 of 11 · [16 — Deployment Operations & Known Limitations](16-deployment-operations.md) · [Previous](16-deployment-operations-part-5.md) · [Next](16-deployment-operations-part-7.md)

### Enum and cast changes are contract operations

This is the class that actually caused an incident, and it involves **no
migration at all**, so no schema review would have caught it.

`8a07a89` removed `neutral` from `UniverseEnum` and `Core\Enums\Universe`, and
edited the shipped `create_clients_table` default. Every row still holding
`preferred_universe = 'neutral'` then threw on read:

```text
ValueError: "neutral" is not a valid backing value for enum Modules\Core\Enums\Universe
```

Locally that was 3/3 clients and 2/2 brands — every client read, including the
login path. The dev server escaped only because its database was empty. The same
mistake had already happened once in the opposite direction; the note recording
it was deleted in the same commit.

Correct sequence for retiring an enum value:

```text
release N    accept the new value; keep the old case in the enum
release N+1  data migration:  UPDATE clients SET preferred_universe='men'
                              WHERE preferred_universe='neutral'
             plus an ALTER migration for the column default
release N+2  remove the old case from the enum
```

Note that changing a `create_*_table` default does **not** alter an existing
database. `migrate` never re-runs an applied migration, so the live column
default stays as it was. Defaults on existing tables need their own `ALTER`
migration.

### Enforcement

`scripts/check_migrations.php`, run by `backend-ci.yml` on every push and PR.
It fails the build on:

1. destructive operations in the `up()` of a **new** migration;
2. modification of a migration that has **already shipped**.

Deliberate contract releases opt out per file, which makes the decision visible
in review:

```php
// @contract-migration: drop legacy column, no code has referenced it since v2.3
```

Run it locally:

```bash
php scripts/check_migrations.php               # vs origin/dev
php scripts/check_migrations.php --all         # every migration
php scripts/check_migrations.php --base=<ref>
```
