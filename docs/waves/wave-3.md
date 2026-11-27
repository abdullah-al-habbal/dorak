---
codeanchors:
  - backend/
  - frontend/
---

# Wave 3: data correctness

Routes: [wave tracker](index.md) · [runbook](runbook.md) · [backlog](../backlog/index.md)

**State:** todo.

**Goal:** Parallel requests cannot break the data.

## Tasks

| Task | Item | What to do | Done when | Status |
|---|---|---|---|---|
| W3.1 | BG-27 | Lock subscription assign and plan delete; add a database backstop | parallel test: one live subscription | todo |
| W3.2 | BG-31 | Lock the default and last-active rules for gateways, currencies, languages | parallel test: one default, at least one active | todo |
| W3.3 | BG-32 | Unique indexes and one create-or-first helper (BD-12: verified phones only) | duplicate requests create one row and never answer 500 | todo |
| W3.4 | BG-33 | Chair writes lock through `BookingLockOrder`; BD-11: one chair per barber per branch | parallel test: delete against booking create | todo |
| W3.5 | BD-10 | One client may not hold overlapping bookings | Pest and a parallel test refuse the overlap with a stable code, in EN and AR | todo |
| W3.6 | BG-34 | Row locks for portfolio order, schedule replace, dispute and rating refresh | parallel tests assert the end state | todo |
| W3.7 | BG-18 | Retry deadlocks and map an exhausted retry to a retryable error | Pest covers the mapping | todo |
| W3.8 | BG-35 | Shared, ordered service locks; `onOneServer()`; unique jobs | lock-order and schedule tests pass | todo |
| W3.9 | release | Wave close ([tracker](index.md#wave-close)) | released, documented, reported | todo |

## Notes

- Read [fix order](../booking-concurrency/10-fix-order.md) first; it holds the conventions and the TS-8 test list.
- W3.3 and W3.4 may edit create migrations: that needs a dev reset, so tell the owner.
- The [coordination board](../sessions/index.md) gives BG-27 to BG-36 and BG-18 to earlier sessions. None was running on this machine on 2026-11-27. Check `ListAgents` again and log the takeover on the board before starting.
- BD-10 has no bug ID; it is a decision in force that is not implemented.

## Log

No entries yet.
