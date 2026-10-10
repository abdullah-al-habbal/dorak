# Queues, Events, Scheduling, Rate Limiting

---

## Jobs

Queue work that is slow, retryable, external, or must not block an API response.

Let Laravel own the execution constraints. Full attribute set verified in
`vendor/laravel/framework/src/Illuminate/Queue/Attributes/` — this repo's convention is
attributes, not properties (see `laravel-attributes`):

| Attribute | Replaces |
|---|---|
| `#[Tries(3)]` | `public $tries` |
| `#[Backoff([10, 60, 300])]` | `public $backoff` |
| `#[Timeout(60)]` | `public $timeout` |
| `#[MaxExceptions(2)]` | `public $maxExceptions` |
| `#[Delay(30)]` | dispatch-time `->delay()` |
| `#[Queue('notifications')]` | `public $queue` |
| `#[Connection('redis')]` | `public $connection` |
| `#[UniqueFor(3600)]` | `public $uniqueFor` |
| `#[WithoutRelations]` | `SerializesModels` relation stripping |
| `#[DeleteWhenMissingModels]` | `public $deleteWhenMissingModels` |
| `#[FailOnTimeout]` | `public $failOnTimeout` |
| `#[DebounceFor(...)]` | manual debounce bookkeeping |

Contracts:

| Contract | Meaning |
|---|---|
| `ShouldQueue` | Run asynchronously |
| `ShouldQueueAfterCommit` | Dispatch only after the surrounding transaction commits |
| `ShouldBeUnique` | At most one instance queued or running |
| `ShouldBeUniqueUntilProcessing` | Uniqueness released when processing starts |
| `ShouldBeEncrypted` | Payload encrypted at rest |

Never hand-build a "duplicate job" Redis flag — that is `ShouldBeUnique` + `#[UniqueFor]` and
a `uniqueId()`.

Dispatch variants, all verified on `Dispatchable`:

```php
ConfirmBookingJob::dispatch($booking)->afterCommit();
ConfirmBookingJob::dispatchIf($shouldNotify, $booking);
ConfirmBookingJob::dispatchUnless($isDraft, $booking);
ConfirmBookingJob::dispatchSync($booking);          // only when synchronous is the intent
ConfirmBookingJob::dispatchAfterResponse($booking); // same request, after the response
```

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

## Notifications

Use Laravel notifications for multi-channel delivery (mail, database, broadcast). Apply the
same after-commit rule when the notification reads data written in a transaction, and prefer
`ShouldQueue` on the notification over dispatching a bespoke job that sends it.

---

## Scheduling

Scheduler constraints are operational semantics. Verified in
`Console/Scheduling/ManagesAttributes.php`:

```php
Schedule::command(RecomputeClientVectorsCommand::class)
    ->hourly()
    ->withoutOverlapping(30)   // minutes before the lock expires
    ->onOneServer()
    ->runInBackground()
    ->when(fn (): bool => config('recommendation.enabled'))
    ->skip(fn (): bool => app()->isDownForMaintenance());
```

- `withoutOverlapping($expiresAt = 1440)` — prevents a second run while one is in flight.
- `onOneServer()` — required for any multi-server deployment; needs a shared, lock-capable
  cache store (the `database` store qualifies).
- `runInBackground()` — for long tasks that should not delay other scheduled entries.
- `->onFailure()` / `->onSuccess()` / `->emailOutputOnFailure()` for reporting.

Never build a custom lock table or scheduler flag. And remember: a scheduler constraint is not
a database integrity guarantee — a job that must not double-book still needs the unique index.

---

## Rate limiting

```php
RateLimiter::for('checkout', function (Request $request): Limit {
    return Limit::perMinute(10)->by($request->user()?->getKey() ?: $request->ip());
});
```

```php
Route::post('/checkout', CheckoutAction::class)->middleware('throttle:checkout');
```

- `Limit::perMinute()`, `perMinutes()`, `perHour()`, `perDay()`, `Limit::none()`.
- Return an array of limits for layered policy (per-user **and** per-IP).
- `->response(fn () => ...)` to shape the 429 body per `api-response-standard`.
- For imperative use: `RateLimiter::attempt($key, $max, $callback, $decay)`,
  `RateLimiter::tooManyAttempts()`, `RateLimiter::availableIn()`, `RateLimiter::clear()`.
- Choose the limiter key to match the intended identity boundary — authenticated user + action
  for account-scoped limits, IP + endpoint for anonymous ones.
- Rate limiting is not authorization and not business validation. It caps volume, nothing more.
