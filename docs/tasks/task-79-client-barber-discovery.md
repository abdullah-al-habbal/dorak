# Task 79: Add Client Barber Discovery and Direct Booking

**Phase:** Phase 14 — Mobile · **Priority:** P2 · **Depends on:** Task 24 (book a barber without a chair), Task 45 (freelancers in search), Task 42 (ratings, for display) · **Audit source:** Mobile audit — "Barber discovery list", "Book from stylist profile", "Barber services"; spec `backend/docs/07_user-flows.md` (Flow 2)

## Overview & Root Cause
Discovery lists branches only. The `GET /explore/barbers` endpoint constant is defined but never called. The stylist profile screen has no booking call-to-action, so a client can only book through a branch's floor plan. `GET /barbers/{barber}/services` has no mobile caller. The result is that freelancers and barbers cannot be discovered or booked directly, which breaks user-flow 2 (find a barber, then book them).

## Evidence
- `frontend/mobile/packages/core/lib/src/network/endpoints/explore.endpoints.dart:5` — `static const String barbers = '/explore/barbers';`, which has no caller in `explore.repository.dart` (only branches, branch detail and barber detail are fetched).
- `frontend/mobile/apps/client_app/lib/src/features/stylist/stylist_profile.screen.dart` — has no booking action or callback.
- `frontend/mobile/apps/client_app/lib/src/core/navigation/app.router.dart` (`discoverBarberSegment` route) — builds `StylistProfileScreen` with no `onBook` handler.
- Backend routes exist: `GET api/v1/explore/barbers`, `GET api/v1/barbers/{barber}/services` (see `routes.tsv`).

## Full-Stack Scope
### Backend (API / DB / Policies)
- None in this task. Barber booking without a chair is delivered by Task 24, freelancers in search by Task 45, and the rating fields by Task 42.

### Dashboard (BFF / React)
- None — client-mobile-only flow.

### Mobile (Flutter / Repositories)
- `explore.repository.dart`: add `getBarbers({lat, lng, radius, filters})` calling `ExploreEndpoints.barbers`, and `getBarberServices(barberId)` for `GET /barbers/{barber}/services` (add the endpoint constant).
- `discovery.bloc.dart` / `discovery.state.dart`: add a branches/barbers segment (or a merged list once Task 45 lands) and keep the existing filter entity.
- `discovery_feed.widget.dart` / `discovery_result_card.widget.dart`: render barber cards that route to `discoverBarberSegment`.
- `stylist_profile.screen.dart` + `stylist_profile.bloc.dart`: load services and add a "Book" CTA. The CTA opens the booking flow pre-filled with `barber_id` and the selected services. Reuse the existing booking bloc; do not add a new navigation stack.
- `app.router.dart`: wire the profile's `onBook` to the existing booking route.

## Acceptance Criteria
- [ ] Repository test: `getBarbers` issues `GET /explore/barbers` with the same lat/lng/radius/universe params as the branch search.
- [ ] Discovery bloc test: switching to the barbers segment loads barbers and emits a success state containing `BarberProfileDto`s.
- [ ] Widget test: the stylist profile shows the services list and an enabled "Book" button. Tapping it pushes the booking route with `barberId` set.
- [ ] Booking bloc test: a booking started from a stylist profile sends `barber_id` and a non-empty `service_ids`, and no `chair_id` (after Task 24).
- [ ] `melos run analyze` and `melos run test` pass.

## Out of Scope
- Text search (Task 43) and the unisex universe (Task 44).
- Slot availability lookup (Task 21).
