---
codeanchors:
  - backend/
  - frontend/
---

# Wave 4: booking experience

Routes: [wave tracker](index.md) · [runbook](runbook.md) · [backlog](../backlog/index.md)

**State:** todo.

**Goal:** Booking is fast, recovers from conflicts, and reminds people.

## Tasks

| Task | Item | What to do | Done when | Status |
|---|---|---|---|---|
| W4.1 | BG-19 | Load a day's data once for slot lists | a query ceiling test; every listed slot can be booked | todo |
| W4.2 | BG-20 | `client_app` recovers from 409, and explains 429 and 503 in EN and AR | bloc tests and `melos verify` pass | todo |
| W4.3 | BG-36 | Idempotent deletes and one idempotency mechanism for creating requests | repeated requests are safe; apps and proxy updated together | todo |
| W4.4 | BG-21 | Honour `Retry-After`; retry only calls the server makes idempotent (`retry.interceptor.dart`); after W4.3 | interceptor tests pass | todo |
| W4.5 | BG-12, FT-20 | Scheduled booking reminders | Pest: sent once per booking, in the recipient's language | todo |
| W4.6 | release | Wave close ([tracker](index.md#wave-close)) | released, documented, reported | todo |

## Notes

- Background: [search and availability](../booking-concurrency/05-search-and-availability.md) and [client sync](../booking-concurrency/06-client-sync-and-ux.md).
- Real reminder delivery also needs RR-8 and RR-16.
- Ask the owner for the reminder timing before building W4.5 if no decision exists.

## Log

No entries yet.
