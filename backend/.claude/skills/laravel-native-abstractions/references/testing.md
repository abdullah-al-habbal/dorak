---
nodeid: skills.backend.laravel-native-abstractions.references.testing
parentnode: skills.backend.laravel-native-abstractions
childnodes:
  - skills.backend.laravel-native-abstractions.references.testing.part-2
  - skills.backend.laravel-native-abstractions.references.testing.part-3
codeanchors:
  - backend/modules/
---

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

## Continued in

- [Part 2: Database assertions](testing-part-2.md)
- [Part 3: What to assert](testing-part-3.md)
