---
codeanchors:
  - backend/modules/
  - backend/scripts/check_migrations.php
  - .github/workflows/deploy.yml
---

# 16 — Deployment operations: migrations, rollback and caches

How the release in `.github/workflows/deploy.yml` behaves and what that requires of a change. Server setup and the
runbook are in the [CI/CD guide](../../docs/deployment/ci-cd-setup.md). The workflow runs only on demand and accepts
only `master`.

## Order of a release

`migrate --force`, then the directory swap, then `config:cache`, `route:cache` and `view:cache`, then the health check
and `queue:restart`.

- **Caches are built after the swap.** Laravel stores absolute paths in its caches. Building the config cache before
  the swap once left every path pointing at the renamed release folder, and Laravel recreated that folder on first
  write. The workflow asserts that no `_release_` path is cached.
- **Migrations run before the swap**, so the previous release serves traffic against the new schema for a while, and
  keeps doing so if a later step fails.
- `view:cache` clears compiled views before writing them, so they don't pile up. Don't add pruning, and don't run
  `view:clear` or `optimize:clear` before the swap: the previous release shares that directory.
- `modules/Core/Config/filesystems.php` needs `APP_URL`; without it the application can't boot.

## Migration safety: expand, then contract

**Before the first production deploy**, an existing table is changed by editing its `create_*_table` migration
([backend guide](../AGENTS.md)), which needs the waiver below and a database reset on dev. From then on, a shipped
migration is never edited, and the rules below apply in full.

| Change | Safe in one release? |
|---|---|
| New table, new index, new nullable column or foreign key, column with a default | Yes |
| New unique index on an existing table | No: the old code may still write duplicates |
| `NOT NULL` without a default on a filled table | No: the old code's inserts fail |
| Drop, rename, narrow or `->change()` | No: the old code reads what is gone |
| Removing an enum case or narrowing a cast | No |
| Data transformation | No |

Adding `softDeletes()` passes these rules but changes behaviour: a release without the model trait returns deleted
rows.

**Enum values are the hidden case.** No migration is involved, so no schema review catches it: removing a case makes
every row that still holds it throw on read. This has happened here. Do it in three releases: accept the new value and
keep the old case; move the stored rows and the column default; then remove the old case. Changing the default inside
a `create_*_table` migration doesn't change an existing database.

### Enforcement

`scripts/check_migrations.php` runs in Backend CI (and in the pre-push hook). It rejects destructive operations in
the `up()` of a new migration and edits to a shipped migration. A deliberate exception is marked in the file, so
review sees it:

```php
// @contract-migration: drop legacy column, no code has referenced it since v2.3
```

```bash
php scripts/check_migrations.php               # against origin/master
php scripts/check_migrations.php --all         # every migration
php scripts/check_migrations.php --base=<ref>  # CI adds --require-base
```

It doesn't see enum or cast changes, behaviour changes such as soft deletes, or data changes made outside a
migration. `tests/Unit/Deployment/MigrationGuardTest.php` tests the guard itself.

## When a deploy fails after migrating

The workflow restores the previous code. **The schema stays migrated**, and some migrations may be applied while a
later one failed, because MySQL and MariaDB commit each one separately.

**Never run `artisan migrate:rollback` to recover.** The restored release doesn't have the new migration files, so
Laravel skips them, rolls back the rest of the batch and exits 0. With a single batch, that drops the whole schema and
reports success. For the same reason, `down()` methods are for development only.

1. Read the workflow output: did migrations run?
2. Run `artisan migrate:status` from the restored release.
3. If every change was safe in one release, do nothing and fix forward. Otherwise restore a backup, or write a
   corrective forward migration. Never delete rows from the `migrations` table.

Restoring code is safe only when the release follows the table above; a marked exception removes that guarantee.

## Production

There is no production environment: the workflow deploys one development server. Before adding one:

1. Give it its own domain, database, `.env` (with a new `APP_KEY`), storage and logs. Share nothing with dev.
2. Use a separate workflow file with its own fixed paths and branch guard, so one edit can't point production at dev.
3. Follow the [production checklist](../../docs/deployment/deployment-guide-part-3.md).
4. One-time codes are logged only when the environment is `local`; check that production isn't.
