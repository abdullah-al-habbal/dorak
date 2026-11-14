---
nodeid: backend.16-deployment-operations.part-7
parentnode: backend.16-deployment-operations
childnodes: []
codeanchors:
  - backend/modules/
---

Part 7 of 11 · [16 — Deployment Operations & Known Limitations](16-deployment-operations.md) · [Previous](16-deployment-operations-part-6.md) · [Next](16-deployment-operations-part-8.md)

Verified against seven cases: `dropColumn`, `->change()`, and NOT-NULL-without-
default are rejected; nullable/defaulted additions, `CREATE` with NOT NULL
columns, and waived destructive changes are allowed; editing a shipped migration
is rejected. All 56 current migrations pass.

**What the guard does not cover:** enum-case removal and cast narrowing. Those
live in `Enums/` and `casts()`, not in migrations, and a reliable automated check
produced too many false positives on legitimate refactors. They remain a review
responsibility — the sequence above is the checklist.

---

## Database rollback policy

```text
application rollback  ≠  database rollback
```

### What "application rollback is safe" means

Precisely this: **the previous release can serve traffic correctly against the
newer schema, indefinitely, with no manual intervention.**

Note the pre-swap window and the post-rollback state are the *same* condition —
old code against new schema. That is why expand/contract is not merely a
migration convention here: it is what makes rollback safe at all. If a release
is expand-only, rollback is safe. If it is not, rollback restores code that will
break, and the deployment's "recovery" is an illusion.

Rollback is **not** safe, whatever the trap prints, when the release contains a
contract operation, an enum-case removal, or a data transformation.

### Which migrations are allowed in the current pre-swap model

Only **expand** operations, unwaived:

| Operation | Allowed pre-swap | Why |
|---|---|---|
| New table | ✅ | Old code does not know it exists |
| Nullable column on existing table | ✅ | Old `INSERT`s omit it; NULL is valid |
| Column with a `default()` | ✅ | Old `INSERT`s omit it; the default applies |
| New index | ✅ | Invisible to application code |
| Nullable FK | ✅ | Old `INSERT`s omit it |
| `softDeletes()` on an existing table | ⚠️ | Structurally safe, semantically not — see below |
| NOT NULL without default | ❌ | Old `INSERT`s fail immediately |
| New UNIQUE on an existing table | ❌ | Old code may write a now-illegal duplicate |
| Drop / rename / narrow / `->change()` | ❌ | Old code queries what is gone |
| Enum-case removal, cast narrowing | ❌ | Existing rows throw on cast |
| Data transformation | ❌ | Not reversible by `down()` |

Current repository state: 52 `CREATE`-only, 4 additive `ALTER`, **0 UNIQUE added
to an existing table**, **0 destructive operations**. Every migration is in the
allowed set, so code rollback is genuinely safe today.

**Deferred contract migrations (job applications, Batch 1).** A UNIQUE index and the data step that must precede it
cannot run pre-swap, so the pre-swap `migrate` sets `DEFER_CONTRACT_MIGRATIONS=1` and those two migrations return
`shouldRun() === false` (SKIPPED, not recorded); the post-swap pass runs them and fails the deploy unless the index
exists and nothing is pending. The post-swap pass runs in maintenance mode after a drain wait (`artisan down`, `queue:restart`, `DORAK_DRAIN_SECONDS`), resolution and index are one retried unit, and a second health check follows `artisan up`. Procedure and failure table:
[duplicate-applications-runbook.md](../../docs/deployment/duplicate-applications-runbook.md).
