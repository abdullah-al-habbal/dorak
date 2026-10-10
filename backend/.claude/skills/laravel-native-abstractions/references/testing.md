# Testing Laravel Abstractions

Test structure, suites, and commands are owned by `testing/SKILL.md` and
`laravel-testing-baseline`. This file covers only one thing: **which framework API to assert
with**, so tests do not reimplement what Laravel already provides.

Stack here: Pest 3 on PHPUnit 11, real MySQL (`dorak_test`), `RefreshDatabase` applied via
`Tests\TestCase`.

---

## Framework fakes

Fake the boundary Laravel owns. Verified available on these facades in 13.20:

| Boundary | API |
|---|---|
| HTTP client | `Http::fake()`, `Http::fakeSequence()`, `Http::preventStrayRequests()`, `Http::assertSent()`, `assertNotSent()`, `assertSentCount()`, `assertNothingSent()` |
| Events | `Event::fake()`, `Event::fakeFor()`, `Event::fakeExcept()`, `assertDispatched()`, `assertNotDispatched()`, `assertDispatchedTimes()`, `assertNothingDispatched()` |
| Queues | `Queue::fake()`, `assertPushed()`, `assertPushedOn()`, `assertNotPushed()`, `assertNothingPushed()` |
| Bus / batches | `Bus::fake()`, `assertDispatched()`, `assertChained()`, `assertBatched()`, `assertBatchCount()` |
| Mail | `Mail::fake()`, `assertSent()`, `assertQueued()`, `assertNothingSent()` |
| Notifications | `Notification::fake()`, `assertSentTo()`, `assertNotSentTo()`, `assertCount()` |
| Storage | `Storage::fake('s3')`, `assertExists()`, `assertMissing()`, `assertDirectoryEmpty()` |
| Processes | `Process::fake()`, `Process::assertRan()` |
| Time | `travelTo()`, `travel()`, `freezeTime()`, `travelBack()` |

There is **no** `Cache::fake()`, `Concurrency::fake()`, or `Schedule::fake()`. For cache,
point the test at the `array` store (or assert on the real configured store); for concurrency,
the `sync` driver runs tasks inline; for the scheduler, assert on the command's own behaviour.

`Event::fake()` with no arguments prevents **all** listeners from running, including model
observers other assertions may depend on. Prefer `Event::fake([BookingConfirmed::class])` so
unrelated framework events still fire.

---

## Database assertions

```php
$this->assertDatabaseHas('bookings', [
    'id' => $booking->id,
    'status' => BookingStatusEnum::Confirmed->value,
]);

$this->assertDatabaseMissing('bookings', ['id' => $stale->id]);
$this->assertDatabaseCount('bookings', 3);
$this->assertModelExists($booking);
$this->assertModelMissing($deleted);
$this->assertSoftDeleted($booking);
$this->assertNotSoftDeleted($booking);
```

Do not hand-write `DB::select(...)` and compare rows. Note the `->value` on enum columns —
these assertions compare raw database values, not casts.

---

## HTTP / feature assertions

Use the response assertion API rather than decoding JSON by hand:

```php
$this->postJson('/api/v1/bookings', $payload)
    ->assertCreated()
    ->assertJsonPath('data.status', BookingStatusEnum::Pending->value)
    ->assertJsonStructure(['success', 'statusCode', 'code', 'message', 'data'])
    ->assertJsonCount(2, 'data.items');
```

`assertOk()`, `assertCreated()`, `assertUnprocessable()`, `assertForbidden()`,
`assertUnauthorized()`, `assertNotFound()`, `assertJsonValidationErrors()`,
`assertJsonMissingPath()`. The envelope shape itself is owned by `api-response-standard`.

---

## What to assert

- Assert **observable behaviour and contracts**: response shape, persisted state, dispatched
  jobs/events, external calls made.
- Do not assert implementation details unless the detail *is* the contract (e.g. "this job must
  land on the `notifications` queue" is a contract; "this Handler calls that private method" is
  not).
- Assert the **rejection** path too: validation failures, 403s, rate limits, uniqueness
  violations, lock contention.
- Query counts matter here because strict mode is off — `DB::listen()` or
  `$this->expectsDatabaseQueryCount()` catch N+1 regressions the framework will not.
- The no-double-booking concurrency test and the tenancy-isolation test are mandatory gates —
  see `laravel-testing-baseline`.

---

## Commands

```bash
composer test                       # config:clear + Pest against dorak_test
php artisan test --filter Booking
vendor/bin/pint --test              # formatting gate (also runs in CI + pre-push)
vendor/bin/phpstan analyse           # larastan; config in phpstan.neon
```

There is no `composer analyse` script in `composer.json` despite `CLAUDE.md` naming one — call
`vendor/bin/phpstan analyse` directly.
