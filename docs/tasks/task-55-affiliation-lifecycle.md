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
- Add `POST /api/v1/affiliations/{affiliation}/terminate` (barber) and `POST /api/v1/branch/affiliations/{affiliation}/terminate` (branch). Status becomes `terminated`, with a `terminated_at` timestamp (the existing column; the spec's `ended_at` is this column under its established name).
- **Decision (resolved, user-directed): on terminate, future bookings are left as-is.** Only `chairs.barber_id` is cleared for the barber's chair at that branch; no Task 28 cancellation/notification is triggered.
- EC‑7: when a brand is deleted, terminate its affiliations before the cascade — both affiliations pointing directly at the brand and at any of its branches (branches cascade-delete with the brand, so their affiliations would otherwise be orphaned).
- **Decision (resolved, user-directed): renamed `accepted` → `active`** — the `AffiliationStatus` enum, every Filament badge/select/color map, and a data migration backfilling existing rows. `accepted_at` and the `accept`-action translation keys are unchanged (they name the action, not the status).
- Invitation notifications are in Task 31 (the existing `AffiliationInvitedNotification`/`AffiliationRespondedNotification` jobs already branch on `initiated_by_type`, so they work unchanged for branch-initiated invites too).

### Dashboard (BFF / React)
- Manager affiliation UI (list, invite, accept/reject, terminate) is in Task 75. This task defines the endpoints it must proxy.

### Mobile (Flutter / Repositories)
- stylist_app: affiliations list with accept/reject/terminate and "request to join" (Task 83). Add endpoints in `frontend/mobile/packages/core/lib/src/network/endpoints/` and a repository method set.
- business_app: invite, accept/reject and terminate (Task 85).

## Acceptance Criteria
- [x] A barber with one accepted affiliation can create a second one to a different branch (201). A duplicate to the same branch returns 409/422.
- [x] `POST /api/v1/branch/affiliations` creates a pending invite (201). The inviting branch cannot accept its own invite (403), and the invited barber can (200).
- [x] `affiliable_id` of a non-existent branch returns 422.
- [x] Terminate returns 200, sets status `terminated`, and clears `chairs.barber_id` for that barber at that branch (DB assertion).
- [x] A third party (another barber or branch) calling terminate gets 403/404 — 403 for the barber route (`BarberAffiliationPolicy::terminate` denial via `FormRequest::authorize()`), 404 for the branch route (ownership-scoped `findOrFail`), matching the existing accept/reject convention in this module.
- [x] Deleting a brand leaves no pending/accepted affiliations pointing at it (Feature test).
- [x] `php artisan test` passes; Pint clean (PHPStan is exempted per `backend/CLAUDE.md`).

### Implemented contract
- Shared code path: `BarberAffiliationPolicy` (now also gates `terminate`), `Modules\BarberAffiliation\Handlers\Shared\TerminateAffiliationHandler`/`TerminateAffiliationEloquentResolver` (one resolver, reused by both the barber and branch terminate routes), `AffiliationInvitedNotification`/`AffiliationRespondedNotification` (already generic on `initiated_by_type`, unchanged).
- Request: `POST /api/v1/barbers/{barber}/affiliate` and `POST /api/v1/branch/affiliations` (new) both validate `affiliable_id`/`barber_id` existence and reject a duplicate pending/active affiliation to the same affiliable (`BarberAlreadyAffiliatedException` → 409). `POST /api/v1/affiliations/{affiliation}/terminate` (barber) and `POST /api/v1/branch/affiliations/{affiliation}/terminate` (branch) take no body.
- Failure: non-existent `affiliable_id`/`barber_id` → 422. Duplicate pending/active affiliation → 409. Terminating a non-active affiliation → 400. A third party calling terminate → 403 on the barber route (`BarberAffiliationPolicy::terminate` via `FormRequest::authorize()`) or 404 on the branch route (ownership-scoped `findOrFail`). A branch accepting/rejecting its own invite → 403 (`cannot_accept_own_invite`).
- Success: `POST /api/v1/branch/affiliations` → 201, `status=pending`, `affiliable_type=branch`, `affiliable_id`=the inviting branch. Terminate → 200, `status=terminated`, `terminated_at` set, and (branch-affiliable only) the barber's chair(s) at that branch get `barber_id=null`.
- Mobile: `packages/core` gained a dedicated `affiliation.endpoints.dart` domain file, `ApiEndpoints.affiliation`, `BarberAffiliationDto`, and `AffiliationRepository`/`DioAffiliationRepository` covering both the barber-side and branch-side lifecycle (create, list, accept, reject, terminate, invite) — mirroring `JobPostingRepository`'s combined-domain shape. No UI (Tasks 75, 83, 85).
- Dashboard: no changes — the affiliation UI is Task 75, which proxies these endpoints; nothing in the dashboard BFF referenced affiliation status strings.
- Deviations: the spec's `ended_at` column name is implemented as the pre-existing `terminated_at` column — no new column was added.

## Out of Scope
- Ownership checks on the existing accept/reject/list routes (Task 01, resolved by this task — see `docs/decisions-required.md`).
- Notifications (Task 31). UI in Tasks 75, 83, 85.
