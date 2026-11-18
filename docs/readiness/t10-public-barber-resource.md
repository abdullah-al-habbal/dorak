---
nodeid: docs.readiness.t10
parentnode: docs.readiness
childnodes: []
codeanchors:
  - backend/modules/Barber/
  - backend/tests/Feature/Contract/ApiResponseContractTest.php
---

# T10. Public barber resource (BG-4)

Status: done (T10.4 waits for the app release) · Phase 6 · Depends on: none · Backlog item BG-4

The public barber resource exposes `email`, `phone`, exact coordinates, `submission_count` and `email_verified_at`.

- [x] T10.1 Add a public resource: name, bio, rating, rounded location.
- [x] T10.2 Point the public endpoints at it; keep the old fields for backward compatibility until both mobile apps ship.
- [x] T10.3 Update the contract tests (they pin `email` today) and the docs.
- [ ] T10.4 Follow-up once both apps ship: remove the old fields.

Acceptance: new resource has no personal fields; existing mobile builds keep working.

## Implementation notes

- New `Modules\Barber\Http\Resources\Shared\PublicBarberResource`: id, name, bio, universe, status, rating, workstation flag, travel radius, location rounded to 2 decimals (about 1 km), distance, ranking fields and `created_at`. No phone, `has_login`, `rejection_reason`, `submission_count` or `email_verified_at`.
- `email` is still present as an empty string. `BarberProfileDto` in the stores today reads it as a required string, so dropping the key would break parsing; that is the only compatibility shim. T10.4 removes it after both apps ship; this task already makes the DTO tolerant (`email` defaults to empty) so the next release can stop depending on it.
- Public endpoints on the new resource: `explore/barbers`, `explore/barbers/{barber}`, `explore/search` barber items, branch detail `barbers`, and the client booking `barber`. The barber's own profile and sign-up responses, and the branch and dashboard resources, keep the full `BarberResource` (the owner of the data or a manager sees it).
- Tests: `tests/Feature/Explore/PublicBarberPrivacyTest.php` (list, detail, shipped-field compatibility, own profile still full); `ApiResponseContractTest` pins `email` as empty. Explore, Booking, Barber and Contract suites pass.
