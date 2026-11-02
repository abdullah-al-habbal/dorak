---
nodeid: backend.16-deployment-operations.part-9
parentnode: backend.16-deployment-operations
childnodes: []
codeanchors:
  - backend/modules/
---

Part 9 of 11 · [16 — Deployment Operations & Known Limitations](16-deployment-operations.md) · [Previous](16-deployment-operations-part-8.md) · [Next](16-deployment-operations-part-10.md)

### Recovery procedure

```text
1. Read the trap output: did migrations run?
2. artisan migrate:status  — run from the RESTORED release.
     Rows marked "Ran?  Yes" with no corresponding file are the migrations
     the restored code does not know about.
3. Decide, do NOT run migrate:rollback:
     • expand-only (the normal case) — no action needed. The restored
       release runs correctly against the newer schema. Fix forward.
     • contract or data change — restore from backup, or hand-write a
       corrective forward migration in the next release.
4. Never delete rows from the `migrations` table to "undo" a migration.
```

### `down()` is a development convenience, not a recovery mechanism

All 56 migrations have a non-empty `down()`, and all of them drop. That is
correct for `CREATE` migrations and lossy for the four ALTERs — rolling those
back discards the added columns' data.

None of that matters in production, because the rollback path cannot reach
those `down()` methods: the restored release does not contain the files. This
is also why the guard's test suite deliberately does **not** test `down()`
reversibility — a green "rollback works" test would assert a capability that
does not exist in the deployment.

Production recovery is restore-from-backup, or fix-forward.

### Enforcement, and its honest limits

`scripts/check_migrations.php` (CI-blocking) rejects contract operations and
edits to shipped migrations. `tests/Unit/Deployment/MigrationGuardTest.php`
covers the guard itself — 9 cases — because CI-blocking logic that silently
stops working takes the policy down with it.

What is **not** enforced, and must not be assumed safe:

- **Enum-case removal and cast narrowing.** They live in `Enums/` and `casts()`,
  not migrations. This is the class that caused the actual incident.
- **Behavioural compatibility.** The `softDeletes()` case above passes every
  automated check and still changes what old code returns.
- **Data transformations** written outside a migration.

The guard raises the floor. It does not make rollback safe by itself — the
expand-only discipline does, and a waiver suspends it for that release.

---
