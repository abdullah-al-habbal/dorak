---
nodeid: docs.readiness.t06
parentnode: docs.readiness
childnodes: []
codeanchors:
  - backend/modules/Barber/
  - backend/modules/Client/Services/ClientAccountDeletion.php
---

# T6. Barber account deletion (backend)

Status: todo · Phase 4 · Depends on: none · Reuses: `ClientAccountDeletion` as the pattern

- [ ] T6.1 `BarberAccountDeletion` service: block on active bookings or affiliations, anonymise, revoke tokens, delete portfolio files.
- [ ] T6.2 `DELETE barber/account`: request, action, error code, EN and AR messages.
- [ ] T6.3 Tests modelled on `DeleteAccountTest`, plus portfolio file removal and the blocked case.
- [ ] T6.4 Document the contract in `backend/docs`.

Acceptance: a barber can delete their account; personal fields are scrubbed; blocked deletion returns a stable code.
