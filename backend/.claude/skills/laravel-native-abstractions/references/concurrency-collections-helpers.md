---
codeanchors:
  - backend/modules/
---

# Concurrency, Deferral, Collections, Helpers

---

## Concurrency

```php
[$branchCount, $bookingCount] = Concurrency::run([
    fn (): int => BranchModel::query()->count(),
    fn (): int => BookingModel::query()->count(),
]);
```

Verified: `Concurrency::run(Closure|array $tasks, CarbonInterval|int|null $timeout = null): array`
and `Concurrency::defer(Closure|array $tasks): DeferredCallback`.

**Repo caveat.** There is no `modules/Core/Config/concurrency.php`, and this app loads config
only from that directory (see `AGENTS.md`), so `concurrency.default` is unset and the
framework falls back to the **`process`** driver. That driver serializes each closure and
shells out to `artisan invoke-serialized-closure` — one PHP process per task. Overhead is real:

- Worth it for several genuinely slow, independent operations (external calls, heavy aggregates).
- Not worth it for two cheap `count()` queries — the process spawn costs more than the queries.
- Measure before adopting. If the app ever needs the cheaper `fork` driver, it requires the
  `spatie/fork` package and a config file to select it.

Rules:

- Only for **independent** work. Never parallelize dependent steps or operations sharing
  mutable state.
- Closures are serialized: no unserializable captures (open PDO handles, `$this` bound to a
  big graph), and the child process does not share the parent's transaction.
- Never run database writes that must be transactional across tasks — each task gets its own
  connection and its own transaction.

For parallel HTTP specifically, prefer `Http::pool()` — see `references/http-client.md`.

---

## Continued in

- [Part 2: Deferred work](concurrency-collections-helpers-part-2.md)
- [Part 3: Collections](concurrency-collections-helpers-part-3.md)
- [Part 4: Helpers](concurrency-collections-helpers-part-4.md)
