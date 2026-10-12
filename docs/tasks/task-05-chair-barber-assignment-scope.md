# Task 05: Scope Chair Barber Assignment to Branch Affiliations

**Phase:** 1 — Security & Authorization · **Priority:** P0 · **Depends on:** None (Task 55 later refines the affiliation semantics) · **Audit source:** Backend route audit (`PATCH chairs/{chair}`, NoAuthz partial); feature audit BE-10 (null unassign ignored)

## Overview & Root Cause
`PATCH /api/v1/chairs/{chair}` validates `barber_id` only with `exists:barbers,id`. A branch can therefore put **any barber on the platform** on its chair. Bookings then attach to that barber, and the barber appears in the branch's floor plan without consent.

Two further defects:
- The resolver ignores an explicit `barber_id: null`, so a barber can never be unassigned through this route.
- The dashboard path has a helper, `ensureWithinBranch`, but it only rejects barbers sitting on another branch's chair. It does not prove the barber belongs to this branch either.

## Evidence
- `backend/modules/Chair/Http/Requests/Client/UpdateChairRequest.php:21`: `'barber_id' => ['nullable', 'string', 'exists:barbers,id']`.
- `backend/modules/Chair/Eloquent/Resolvers/Client/UpdateChairEloquentResolver.php:26-27`: `if ($command->barberId !== null)`, so `null` is silently dropped.
- `backend/modules/Dashboard/Eloquent/Resolvers/Chairs/ChairBarberAssignmentResolver.php:11-20`: only checks that the barber is not assigned elsewhere.
- `backend/modules/Dashboard/Handlers/Chairs/StoreChairHandler.php:21` and `UpdateChairHandler.php:25`: call `ensureWithinBranch`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Introduce one shared rule or service, `BarberBelongsToBranch`. It returns true when either:
  - the barber was created as a managed barber by the branch, or
  - the barber has an `accepted` affiliation whose affiliable is the branch or its brand.
- Decision resolved: both branch-managed barbers and barbers with an accepted affiliation to the branch or its brand count as members.
- Apply the rule in `UpdateChairRequest` and in the Dashboard `ChairBarberAssignmentResolver`, replacing the current weaker check.
- Distinguish "key absent" (leave unchanged) from "explicit null" (unassign). The command needs a tri-state value or a `barberIdProvided` flag.

### Dashboard (BFF / React)
- `frontend/dashboard/src/services/api/dashboard/chair-form.schema.ts`: the barber picker must allow clearing (send `null`).
- Show a 422 validation error on the `barber_id` field when the backend rejects a barber.

### Mobile (Flutter / Repositories)
- None. Neither the business app nor the stylist app calls `PATCH /chairs/{chair}` today. Chair toggling in the business app is Task 85.

## Acceptance Criteria
- [ ] `PATCH /api/v1/chairs/{chair}` with a `barber_id` not affiliated with or managed by the chair's branch returns 422 with an error on `barber_id`, and the chair is unchanged.
- [ ] `PATCH /api/v1/chairs/{chair}` with `{"barber_id": null}` returns 200, and `chairs.barber_id` becomes NULL.
- [ ] `PATCH` without a `barber_id` key leaves the current assignment unchanged.
- [ ] Dashboard `POST`/`PUT /api/v1/dashboard/chairs` apply the same membership rule and return 422 for a foreign barber.
- [ ] Feature tests `tests/Feature/Chair/ChairBarberAssignmentTest.php` and additions to `tests/Feature/Dashboard/ChairApiTest.php` cover the cases above.
- [ ] `php artisan test` passes; PHPStan (max) and Pint are clean for touched files.

## Out of Scope
- Unassigning chairs when an affiliation ends: Task 55.
- Chair maintenance conflicts with existing bookings: Task 27.
