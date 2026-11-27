---
codeanchors:
  - backend/modules/
---

Part 4 of 4 · [Query Builder, Set-Based Persistence, and Raw SQL](query-builder-and-sql.md) · [Previous](query-builder-and-sql-part-3.md)

## Raw SQL rules

1. Never interpolate user input into SQL. Bind it.
   `selectRaw('... ?', [$value])`, `whereRaw('a > b * ?', [$multiplier])`.
2. `sprintf('%f', $userFloat)` is *coercion*, not binding. It is safe for floats but sets a
   pattern the next author will copy with a string. Prefer bindings in new code.
3. Every raw fragment carries a one-line comment saying why no Eloquent/Query Builder method
   fits.
4. Prefer `DB::raw()` inside `selectRaw`/`orderByRaw`/`havingRaw` over assembling a whole
   query string.
5. Raw expressions are not portable. If a fragment is MySQL-specific, say so in the comment.

---

## Pagination

Use the framework paginators; never hand-roll `LIMIT`/`OFFSET` plus a count query.

| Need | API |
|---|---|
| Page numbers and a total | `paginate($perPage)` → `LengthAwarePaginator` |
| Next/previous only, cheaper | `simplePaginate($perPage)` |
| Large or realtime data sets, stable under inserts | `cursorPaginate($perPage)` |

Cursor pagination requires a deterministic `orderBy` and cannot jump to an arbitrary page.
It is the right default for infinite-scroll feeds; `paginate()` stays right for admin tables
that show a page count.

Shape paginated output through `ApiResponseTrait`'s paginated helper — see
`api-response-standard`.
