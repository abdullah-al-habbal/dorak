---
codeanchors:
  - backend/modules/
---

Part 3 of 3 · [Queues, Events, Scheduling, Rate Limiting](queues-events-scheduling.md) · [Previous](queues-events-scheduling-part-2.md)

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
