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
- [ ] Every booking row on `/admin/bookings` and `/manager/bookings` has a link to `/{actor}/bookings/{id}`. RTL test.
- [ ] The booking detail page renders no link to `/bookings/{id}/edit`. RTL test.
- [ ] For a `confirmed` booking, the status selector offers exactly the transitions the backend allows. Selecting an illegal status is impossible, and if forced via the API the backend answers 422.
- [ ] For a terminal booking, the status form is not rendered.
- [ ] `npm run test`, `npm run lint` and `npm run typecheck` pass.

## Out of Scope
- The backend lifecycle itself (Task 18).
- Status history display (Task 64).

> Note (Task 40): the client-review contract is ready — `rateClient` on `BranchOperationsRepository` in `packages/core`, and staff booking payloads carry `client.reputation {average, count}` (`BookingDto.client`, dashboard `IBooking.client`).
