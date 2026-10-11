# Task 01: Fix Barber Affiliation Ownership Authorization

**Phase:** 1 — Security & Authorization · **Priority:** P0 · **Depends on:** None · **Audit source:** Backend route audit (NoAuthz rows); `backend/docs/features/BE-07-barber-affiliation-api.md`

## Overview & Root Cause
The four barber-guarded affiliation routes trust the route parameters and never compare them with the authenticated barber. The accept and reject resolvers load the affiliation with `findOrFail()` and update it directly. Any authenticated barber can therefore:
- accept or reject any pending affiliation, including a request they filed themselves;
- create affiliations on behalf of another barber;
- read any barber's affiliation list.

This is an IDOR (insecure direct object reference) across tenants.

## Evidence
- `backend/modules/BarberAffiliation/Routes/Api/V1/barber-affiliations.php:11-15`: all four routes sit under `auth:barber` only.
- `backend/modules/BarberAffiliation/Eloquent/Resolvers/Barber/AcceptAffiliationEloquentResolver.php`: `BarberAffiliationModel::findOrFail(...)` then `update(Accepted)`, with no actor check.
- `backend/modules/BarberAffiliation/Eloquent/Resolvers/Barber/RejectAffiliationEloquentResolver.php`: same pattern for reject.
- `backend/modules/BarberAffiliation/Http/Requests/Barber/AcceptAffiliationRequest.php`: no ownership logic in the request.
- `backend/modules/BarberAffiliation/Http/Actions/Barber/CreateAffiliationAction.php:21-25`: `{barber}` from the route is passed straight into the command.
- `backend/modules/BarberAffiliation/Http/Actions/Barber/ListBarberAffiliationsAction.php:16`: `where('barber_id', $barber)` uses the route parameter only.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Add `BarberAffiliationPolicy` (`view`, `create`, `accept`, `reject`) and register it.
- **Create and list:** the `{barber}` route parameter must equal `Auth::guard('barber')->id()`; otherwise return 403.
- **Accept and reject:** only the party that did not initiate the request may decide.
  - Decision required: which party is the "receiving party" depends on the invite direction designed in Task 55. Until then, a barber may accept or reject only affiliations whose `barber_id` is their own **and** that were not initiated by them. If no initiator column exists, add `initiated_by_type` and `initiated_by_id`.
- Run every check in `FormRequest::authorize()` or through the policy. Return 403 with the standard `ApiResponseBodyValueObject` error shape.

### Dashboard (BFF / React)
- None. No dashboard caller of these routes exists today. The affiliation UI is Task 75.

### Mobile (Flutter / Repositories)
- None. The stylist app has no affiliation flow yet (Task 83). Task 83 must surface 403 responses as a "not allowed" error state.

## Acceptance Criteria
- [ ] `POST /api/v1/barbers/{otherBarber}/affiliate` as barber A returns 403, and no row is inserted.
- [ ] `GET /api/v1/barbers/{otherBarber}/affiliations` as barber A returns 403.
- [ ] `POST /api/v1/affiliations/{id}/accept` by a barber unrelated to the affiliation returns 403, and the status stays `pending`.
- [ ] `POST /api/v1/affiliations/{id}/accept` by the initiating barber on their own request returns 403.
- [ ] The legitimate counter-party accept or reject still returns 200, and the status changes.
- [ ] Feature tests `tests/Feature/BarberAffiliation/AffiliationAuthorizationTest.php` cover every case above.
- [ ] `php artisan test` passes; PHPStan (max) and Pint are clean for touched files.

## Out of Scope
- Shop-initiated invites, several active affiliations at once, and terminating an affiliation (Task 55).
- Affiliation notifications (Task 31).
