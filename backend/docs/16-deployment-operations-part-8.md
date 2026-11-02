---
nodeid: backend.16-deployment-operations.part-8
parentnode: backend.16-deployment-operations
childnodes: []
codeanchors:
  - backend/modules/
---

Part 8 of 11 · [16 — Deployment Operations & Known Limitations](16-deployment-operations.md) · [Previous](16-deployment-operations-part-7.md) · [Next](16-deployment-operations-part-9.md)

**The `softDeletes()` caveat.** `0001_01_01_200002` added `deleted_at` to
`clients`. Structurally that is a nullable column and old code keeps working.
But a release *before* `SoftDeletes` was on the model has no global scope, so it
would return soft-deleted clients as if they were live. Structural
compatibility is not behavioural compatibility. Rolling back across a migration
like this needs a moment's thought even though the guard permits it.

### What happens when migrations have run and the deployment then fails

1. The trap restores the previous release directory.
2. **The schema stays migrated.** Nothing reverts it.
3. The trap prints the warning below.

Two findings make this sharper than it looks, both verified rather than assumed:

**Migrations may be partially applied.** MySQL/MariaDB have no transactional
DDL, so Laravel commits each migration on its own. A run that fails on
migration 7 leaves 1–6 applied *and recorded*. Verified locally: a valid
migration was applied and written to the `migrations` table while the command
exited 1 because a later one failed. `deploy.yml` therefore sets
`MIGRATIONS_APPLIED` **before** invoking `migrate`, not after — setting it
afterwards meant the warning never fired for the case that needs it most.

**`artisan migrate:rollback` is actively dangerous here — do not use it.**
The restored release does not contain the new migration's file. Laravel's
`Migrator::rollbackMigrations` (framework `Migrator.php:333`) prints
`Migration not found` and `continue`s — it *skips* that migration, leaves the
schema changed and the `migrations` row in place, and **rolls back the rest of
the batch anyway, exiting 0**.

Verified end to end on a throwaway database:

```text
migrate:rollback  →  exit 0
  probe migration : table STILL exists, migrations row STILL present
  everything else in batch 1 : rolled back
```

On a database whose baseline is a single batch, that is the entire schema
destroyed, reported as success. An operator reaching for `migrate:rollback`
after a failed deploy would make the incident far worse.
