# Task 55: Complete Affiliation Lifecycle

**Phase:** Phase 8 — Brand, Branch & Barber Platform · **Priority:** P2 · **Depends on:** Task 01, Task 05, Task 18, Task 31 · **Audit source:** Product-spec audit (Barber, Branch/Brand), feature-spec audit (BE-07); `backend/docs/04_house-rules.md:35-36` (C4/C5), `backend/docs/08_edge-cases.md:37,45,53` (EC‑7/8/10), `backend/docs/07_user-flows.md:116-120` (Flow 7)

## Overview & Root Cause
Affiliations currently support only barber-initiated create, plus accept/reject. Gaps:
- **No shop-side invite (Flow 7).** Only `auth:barber` can create an affiliation.
- **Only one active affiliation per barber.** Creation throws if any accepted affiliation exists, but the spec says a barber may be affiliated with several shops (C4/EC‑8).
- **No way to end an affiliation (C5/EC‑10).** The barber's chair isn't unassigned, and future bookings aren't handled.
- **`affiliable_id` existence isn't validated.**
- **Deleting a brand doesn't end its affiliations (EC‑7).**
- **Status naming drift.** The code uses `accepted` where the spec says `active`.

## Evidence
- `backend/modules/BarberAffiliation/Eloquent/Resolvers/Barber/CreateAffiliationEloquentResolver.php:19-23` — throws `BarberAlreadyAffiliatedException` if any `Accepted` affiliation exists.
- `backend/modules/BarberAffiliation/Http/Requests/Barber/CreateAffiliationRequest.php:17` — `affiliable_id` is `['required','string']` with no existence check.
- `backend/modules/BarberAffiliation/Routes/Api/V1/barber-affiliations.php` — no terminate route.
- `backend/modules/BarberAffiliation/Enums/AffiliationStatus.php` — status enum.
- `backend/modules/Branch/Http/Actions/Branch/AcceptAffiliationAction.php`, `RejectAffiliationAction.php`, `ListAffiliationsAction.php` — the branch side can accept/reject but cannot invite.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Add `POST /api/v1/branch/affiliations` (auth:branch_api) to invite a barber. Store the initiator (`initiated_by`: barber|affiliable). Only the non-initiating side can accept or reject; this extends the Task 01 ownership policy.
- Remove the single-active restriction. Prevent only a duplicate pending/accepted affiliation to the same affiliable.
- Validate `affiliable_id` exists for the given `affiliable_type` (422 otherwise).
- Add `POST /api/v1/affiliations/{affiliation}/terminate` (barber, owner) and `POST /api/v1/branch/affiliations/{affiliation}/terminate` (branch). Status becomes `terminated`, with an `ended_at` timestamp.
- On terminate, unassign the barber from the branch's chairs (`chairs.barber_id = null`). For future bookings, decision required: cancel and notify via Task 28, or keep them.
- EC‑7: when a brand is deleted, terminate its affiliations before the cascade.
- Decision required: rename `accepted` to `active`, or update the spec (record the outcome in Task 87).
- Invitation notifications are in Task 31.

### Dashboard (BFF / React)
- Manager affiliation UI (list, invite, accept/reject, terminate) is in Task 75. This task defines the endpoints it must proxy.

### Mobile (Flutter / Repositories)
- stylist_app: affiliations list with accept/reject/terminate and "request to join" (Task 83). Add endpoints in `frontend/mobile/packages/core/lib/src/network/endpoints/` and a repository method set.
- business_app: invite, accept/reject and terminate (Task 85).

## Acceptance Criteria
- [ ] A barber with one accepted affiliation can create a second one to a different branch (201). A duplicate to the same branch returns 409/422.
- [ ] `POST /api/v1/branch/affiliations` creates a pending invite (201). The inviting branch cannot accept its own invite (403), and the invited barber can (200).
- [ ] `affiliable_id` of a non-existent branch returns 422.
- [ ] Terminate returns 200, sets status `terminated`, and clears `chairs.barber_id` for that barber at that branch (DB assertion).
- [ ] A third party (another barber or branch) calling terminate gets 403.
- [ ] Deleting a brand leaves no pending/accepted affiliations pointing at it (Feature test).
- [ ] `php artisan test` passes; PHPStan max + Pint clean.

## Out of Scope
- Ownership checks on the existing accept/reject/list routes (Task 01).
- Notifications (Task 31). UI in Tasks 75, 83, 85.
