---
nodeid: backend.16-deployment-operations.part-5
parentnode: backend.16-deployment-operations
childnodes: []
codeanchors:
  - backend/modules/
---

Part 5 of 11 · [16 — Deployment Operations & Known Limitations](16-deployment-operations.md) · [Previous](16-deployment-operations-part-4.md) · [Next](16-deployment-operations-part-6.md)

## Migration safety — the expand/contract policy (enforced)

### Why it matters here

Migrations run **before** the atomic swap:

```text
migrate  →  route:cache  →  SWAP  →  config:cache  →  view:cache  →  health
```

Between `migrate` and the swap, the **previous** release serves traffic against
the **new** schema. If a later step fails, the trap restores the old code and
the schema stays migrated. Only backward-compatible migrations survive that.

### What the current 56 migrations actually contain

Audited 2026-08-23 with `php scripts/check_migrations.php --all`:

| Category | Count |
|---|---|
| `CREATE`-only (new tables) | 52 |
| Additive `ALTER` | 4 |
| **Destructive operations in any `up()`** | **0** |
| Non-empty `down()` | 56 / 56 |

All four ALTERs add nullable or defaulted columns only:

```php
$table->decimal('travel_radius', 5, 2)->nullable()                  // barbers
$table->string('phone')->nullable(); $table->string('avatar')->nullable();
$table->string('status', 20)->default('enabled'); $table->softDeletes();
$table->json('requirements')->nullable(); …->string('type')->nullable()
$table->foreignId('catalog_item_id')->nullable()->constrained()->nullOnDelete()
```

**Every migration in the repository is already expand-safe.** The pre-swap
ordering is correct for the current set; the policy exists to keep it that way.

### The rule

**Expand — safe, ships in one release:**

- new tables
- new columns that are `nullable()` or have a `default()`
- new indexes
- new **nullable** foreign keys

**Contract — must be a separate, later release:**

- dropping or renaming a column or table
- narrowing a type, or `->change()` of any kind
- adding `NOT NULL` without a default to a populated table
- **removing an enum case, or narrowing a cast**
- data transformations

**Never:** edit a migration that has already shipped. Add a new one.
