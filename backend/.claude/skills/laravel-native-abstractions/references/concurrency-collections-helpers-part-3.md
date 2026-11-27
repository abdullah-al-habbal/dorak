---
codeanchors:
  - backend/modules/
---

Part 3 of 4 · [Concurrency, Deferral, Collections, Helpers](concurrency-collections-helpers.md) · [Previous](concurrency-collections-helpers-part-2.md) · [Next](concurrency-collections-helpers-part-4.md)

## Collections

When the data is already a Collection, use the operator instead of converting to an array and
rebuilding common behaviour.

| Intent | Operator |
|---|---|
| Keep / drop by predicate | `filter()`, `reject()` |
| Filter by key/value | `where()`, `whereIn()`, `whereNotIn()`, `whereNull()`, `whereInstanceOf()` |
| Transform | `map()`, `mapWithKeys()`, `flatMap()`, `mapInto()` |
| Group / index | `groupBy()`, `keyBy()` |
| Split by predicate | `partition()` |
| Deduplicate | `unique()`, `duplicates()` |
| Membership | `contains()`, `containsStrict()`, `containsOneItem()` |
| Retrieve one | `first()`, `firstWhere()`, `sole()`, `last()` |
| Aggregate | `sum()`, `avg()`, `min()`, `max()`, `count()`, `countBy()` |
| Ordering | `sortBy()`, `sortByDesc()`, `sortDesc()`, `sortKeys()` |
| Flow control | `when()`, `unless()`, `tap()`, `pipe()`, `pipeThrough()` |
| Type safety | `ensure(BookingModel::class)` |
| Chunked work | `chunk()`, `chunkWhile()`, `sliding()` |

`sole()` when "exactly one" is a domain invariant — zero and many both throw instead of
silently returning a row.

Do not write a five-line `foreach` for something an operator names. Do not force Collection
APIs onto work that should stay set-based SQL — filtering 10,000 rows in PHP after `get()` is
a defect, not a style choice.

`LazyCollection` (from `lazy()` / `lazyById()` / `cursor()`) supports most of the same
operators without materializing everything.

---
