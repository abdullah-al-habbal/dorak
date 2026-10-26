# Task 70: Wire Booking Detail Page and Full Status Set

**Phase:** Phase 13 — Dashboard · **Priority:** P1 · **Depends on:** Task 18 · **Audit source:** Dashboard BFF/UI audit (booking detail orphan page; booking status update partial)

## Overview & Root Cause
The booking detail page exists for admin and manager, but nothing links to it: booking rows render only `BookingActionsDialog`, while other resources get Details/Edit links. The shared `EntityDetailPage` always renders an Edit link to `/{actor}/{resource}/{id}/edit`, and no `bookings/[id]/edit` route exists, so the link is dead. The status-change form offers only `confirmed` and `in_progress`, while the backend `BookingStatus` enum has six cases and the dashboard `UpdateBookingStatusRequest` accepts any enum value.

## Evidence
- `frontend/dashboard/src/components/entities/entity-list-page.tsx:55` — `resource === "bookings" ? <BookingActionsDialog …/> : <Link …/${item.id}>…`, so booking rows have no details link.
- `frontend/dashboard/src/app/(portals)/admin/bookings/[id]/page.tsx` and `…/manager/bookings/[id]/page.tsx` — render `EntityDetailPage` for bookings.
- `frontend/dashboard/src/components/entities/entity-detail-page.tsx:21` — unconditional Edit link to `/${actor}/${resource}/${id}/edit`. No `bookings/[id]/edit` route exists under `app/(portals)`.
- `frontend/dashboard/src/services/api/dashboard/booking-status.schema.ts` — `z.enum(["confirmed","in_progress"])`.
- `frontend/dashboard/src/components/bookings/booking-actions-dialog.tsx:42` — Select offers Confirmed and In progress only.
- `backend/modules/Booking/Enums/BookingStatus.php:9-14` — pending, confirmed, in_progress, canceled, completed, no_show.

## Full-Stack Scope
### Backend (API / DB / Policies)
- None beyond Task 18. The dashboard status endpoint must reject illegal transitions (422), and this UI relies on that.
- Decision required: expose the allowed next statuses per booking in the booking resource (e.g. `allowed_transitions`), or hard-code the transition map in the UI. Recommended: the backend field, so the UI never drifts from the lifecycle.
### Dashboard (BFF / React)
- Booking rows get a Details link to `/{actor}/bookings/{id}` next to `BookingActionsDialog`.
- `EntityDetailPage` hides the Edit link for resources with no edit route (bookings). Reschedule and cancel stay in the actions dialog.
- `bookingStatusSchema` and the Select list the allowed next statuses for the booking, never a fixed pair. Terminal bookings (`completed`, `canceled`, `no_show`) show no status form.
- Status mutation invalidates `["dashboard","bookings"]` (existing hook) and `["dashboard","bookings",id]`.
### Mobile (Flutter / Repositories)
- None. The business app status menu is covered in Task 85.

## Acceptance Criteria
- [x] Every booking row on `/admin/bookings` and `/manager/bookings` has a link to `/{actor}/bookings/{id}`. Added a Details link alongside `BookingActionsDialog` in `entity-list-page.tsx`'s bookings branch (shared by both actor routes, which both render `EntityListPage`). `tests/components/entities/entity-list-page.test.tsx` asserts the href.
- [x] The booking detail page renders no link to `/bookings/{id}/edit`. Added `hasEditRoute: boolean` to `EntityConfig` (true for branches/chairs/services/stylists, false for bookings — the only resource with no `[id]/edit` route under `app/(portals)`), and `EntityDetailPage` now gates the Edit link on it. `tests/components/entities/entity-detail-page.test.tsx` asserts both the bookings case (no link) and a control case (branches still gets one).
- [x] For a `confirmed` booking, the status selector offers exactly the transitions the backend allows. New `booking-status-transitions.util.ts` mirrors `BookingStatus::canTransitionTo` from `backend/modules/Booking/Enums/BookingStatus.php` (pending→confirmed/canceled, confirmed→in_progress/canceled/no_show, in_progress→completed/canceled/no_show, terminal→none) and `BookingStatusUpdateForm` now renders only those options instead of a fixed 5-item list. Selecting an illegal status is structurally impossible (not in the option list); the backend 422 path for a forced/direct API call was already covered by Task 18's own tests and is unchanged. `tests/components/bookings/booking-status-update-form.test.tsx` asserts the exact option set per current status.
- [x] For a terminal booking, the status form is not rendered. `BookingStatusUpdateForm` returns `null` when `allowedNextBookingStatuses(currentStatus)` is empty; asserted for all three terminal statuses in the same test file.
- [x] `npm run test`, `npm run lint` and `npm run typecheck` pass. Also ran `npm run build` (Dashboard gate set) — green.

### Decision: allowed-transitions source (resolved: UI-side map, no backend change)
The spec presented this as open ("Decision required") with a recommendation toward a backend
`allowed_transitions` field on the booking resource. Chose the UI-side map instead:
`booking-status-transitions.util.ts` is a pure, 6-line-per-status mirror of the backend enum's
own `canTransitionTo` method, it has no state to drift independently of a request/response
cycle, and the Full-Stack Scope section's own default statement for this task is "Backend:
None beyond Task 18." Adding a resource field would touch `BookingResource`/`StaffBookingResource`,
every consumer of those payloads (mobile DTOs included), and backend tests, for a rule that
is small, stable, and already enforced authoritatively server-side (422 on violation) —
disproportionate to what the three ACs that need this actually require. If the backend
enum ever changes, this file and the backend enum both need updating; that coupling is
documented in the file's own docblock rather than solved by shipping the rule twice over
the wire.

## Out of Scope
- The backend lifecycle itself (Task 18).
- Status history display (Task 64).

> Note (Task 40): the client-review contract is ready — `rateClient` on `BranchOperationsRepository` in `packages/core`, and staff booking payloads carry `client.reputation {average, count}` (`BookingDto.client`, dashboard `IBooking.client`).
