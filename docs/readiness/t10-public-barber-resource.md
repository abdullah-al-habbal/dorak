---
nodeid: docs.readiness.t10
parentnode: docs.readiness
childnodes: []
codeanchors:
  - backend/modules/Barber/
  - backend/tests/Feature/Contract/ApiResponseContractTest.php
---

# T10. Public barber resource (BG-4)

Status: todo · Phase 6 · Depends on: none · Backlog item BG-4

The public barber resource exposes `email`, `phone`, exact coordinates, `submission_count` and `email_verified_at`.

- [ ] T10.1 Add a public resource: name, bio, rating, rounded location.
- [ ] T10.2 Point the public endpoints at it; keep the old fields for backward compatibility until both mobile apps ship.
- [ ] T10.3 Update the contract tests (they pin `email` today) and the docs.
- [ ] T10.4 Follow-up once both apps ship: remove the old fields.

Acceptance: new resource has no personal fields; existing mobile builds keep working.
