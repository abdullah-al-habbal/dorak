---
nodeid: docs.readiness.t06
parentnode: docs.readiness
childnodes: []
codeanchors:
  - backend/modules/Barber/
  - backend/modules/Client/Services/ClientAccountDeletion.php
---

# T6. Barber account deletion (backend)

Status: done · Phase 4 · Depends on: none · Reuses: `ClientAccountDeletion` as the pattern

- [x] T6.1 `BarberAccountDeletion` service: block on active bookings or affiliations, anonymise, revoke tokens, delete portfolio files.
- [x] T6.2 `DELETE barber/account`: request, action, error code, EN and AR messages.
- [x] T6.3 Tests modelled on `DeleteAccountTest`, plus portfolio file removal and the blocked case.
- [x] T6.4 Document the contract in `backend/docs`.

Acceptance: a barber can delete their account; personal fields are scrubbed; blocked deletion returns a stable code.

## Implementation notes

- Anonymise in place, not delete: `barbers` has no soft delete and bookings, reviews and client history reference the row. The status becomes `disabled`, so discovery and login are closed.
- The route sits outside the status scope, so pending, rejected and disabled barbers can delete too.
- A test caught that clearing a translatable `bio` only emptied the current locale; the bio is now nulled at the query level.
- Blocks: active bookings (`ACCOUNT_HAS_ACTIVE_BOOKINGS`) and an active affiliation (`ACCOUNT_HAS_ACTIVE_AFFILIATION`). A barber with an active affiliation must have it ended by the brand or branch first; the stylist app (T9) explains this.
- Tests: `tests/Feature/Barber/Http/Actions/BarberDeleteAccountTest.php` (14 tests); Barber, Architecture, Contract and route-coverage suites pass.
