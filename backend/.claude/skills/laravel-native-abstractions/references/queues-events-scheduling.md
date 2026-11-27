---
codeanchors:
  - backend/modules/
---

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

## Continued in

- [Part 2: Batches and chains](queues-events-scheduling-part-2.md)
- [Part 3: Notifications](queues-events-scheduling-part-3.md)
