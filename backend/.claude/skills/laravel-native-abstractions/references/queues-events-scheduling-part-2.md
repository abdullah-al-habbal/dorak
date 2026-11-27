---
codeanchors:
  - backend/modules/
---

Part 2 of 3 · [Queues, Events, Scheduling, Rate Limiting](queues-events-scheduling.md) · [Previous](queues-events-scheduling.md) · [Next](queues-events-scheduling-part-3.md)

Payload hygiene: pass identifiers, not large or security-sensitive payloads. `SerializesModels`
stores the key and re-resolves the model at run time; add `#[WithoutRelations]` so loaded
relations are not serialized with it.

### Batches and chains

```php
// Sequential — each runs only if the previous succeeded.
Bus::chain([new ImportRow($a), new ImportRow($b), new FinishImport()])->dispatch();

// Parallel set with completion callbacks.
Bus::batch($jobs)
    ->allowFailures()
    ->then(fn (Batch $batch) => Log::info('done'))
    ->catch(fn (Batch $batch, Throwable $e) => report($e))
    ->dispatch();
```

Use a batch when "all of these, then that" is the requirement, instead of a counter row you
increment yourself.

---

## Events

Use events for completed domain facts that other modules may react to:

```php
BookingConfirmed::dispatch($booking);
```

Rules:

- The initiating Action/Handler keeps ownership of the required outcome. Do not push mandatory
  business steps into listeners to make a Handler look short — the outcome becomes invisible
  and untestable as one unit.
- Queued listeners that read transactionally written data need after-commit semantics, same as
  jobs.
- Model events (`created`, `updating`, …) and observers are appropriate for invariants that
  must hold for *every* write path; they are the wrong place for orchestration that belongs in
  a Handler.
- `Event::defer()` (verified, `Events/Dispatcher.php:851`) collects dispatched events and
  releases them after the callback completes — use it when several related writes must all
  land before any listener observes them:

```php
Event::defer(function (): void {
    $this->writeBooking($command);
    $this->writePayment($command);
});
```

- `Model::withoutEvents()` / `saveQuietly()` for deliberate silence — never as a way to dodge
  an observer you did not want to think about.

---
