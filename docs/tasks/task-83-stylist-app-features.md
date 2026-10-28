# Task 83: Build Stylist App Features

**Phase:** Phase 14 — Mobile · **Priority:** P2 · **Depends on:** Task 82 (stylist shell), Task 01 (affiliation ownership), Task 55 (affiliation lifecycle), Task 06 (application status authz), Task 56 (job board), Task 54 (barber bio/services), Task 28 (notifications on cancel) · **Audit source:** Mobile audit — stylist rows (cancel, schedule, portfolio, profile edit/travel radius, affiliations, jobs, activation)

## Overview & Root Cause
The stylist app implements only today's appointments, the workstation toggle and accept/start/complete/no-show. The backend exposes many more barber routes with no mobile caller:
- Cancel (`barber/bookings/{booking}/cancel`).
- Schedule (GET/PATCH).
- Portfolio (list/upload/delete).
- Profile edit and travel radius.
- Affiliations (request, list, accept/reject).
- Job browse/apply/applications.

`JobPostingRepository` exists but is never instantiated. `transitionBooking` throws for any action other than the four it supports.

## Evidence
- `frontend/mobile/packages/core/lib/src/network/endpoints/operations.endpoints.dart:8-14` — barber endpoints are limited to today, profile, workstation and accept/start/complete/no-show. There is no cancel, schedule, portfolio or travel-radius constant.
- `frontend/mobile/packages/core/lib/src/network/repositories/operations.repository.dart:68-75` — the `transitionBooking` switch hits `_ => throw ArgumentError` for other actions.
- `frontend/mobile/packages/core/lib/src/network/repositories/job_posting.repository.dart:4-8` — job/apply/applications methods; `DioJobPostingRepository` is never constructed in `apps/`.
- Backend routes (`routes.tsv`): `POST barber/bookings/{booking}/cancel`, `GET|PATCH barber/schedule`, `GET|POST barber/portfolio`, `DELETE barber/portfolio/{photo}`, `PATCH barber/profile`, `PATCH barber/travel-radius`, `POST barbers/{barber}/affiliate`, `GET barbers/{barber}/affiliations`, `POST affiliations/{affiliation}/accept|reject`, `GET jobs`, `GET jobs/{job}`, `POST jobs/{job}/apply`, `GET applications`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- None new here. Ownership fixes (Task 01) must land before the affiliation UI. The application-status decision moves to branch managers (Task 06), so the stylist app must **not** expose `PUT applications/{application}/status`.
- **Decision (T83-1, resolved): no self activate/deactivate UI.** The spec prescribes waiting for Task 53; the workstation toggle remains the only availability control.

### Dashboard (BFF / React)
- None — the dashboard barber workspace is covered by Tasks 68/69.

### Mobile (Flutter / Repositories)
- Endpoints + repository: add `barberBookingCancel` (POST, with `reason`), `barberSchedule`, `barberPortfolio`, `barberPortfolioPhoto`, `barberTravelRadius`, and the affiliation endpoints. Extend `StylistOperationsRepository` and add a `BarberAffiliationRepository`.
- Screens (registered in the Task 82 router):
  - **Booking actions:** a cancel action with a reason sheet on the today list.
  - **Schedule:** a weekly hours editor.
  - **Portfolio:** a grid with upload (multipart) and delete.
  - **Profile:** edit fields, travel-radius slider, bio once Task 54 lands.
  - **Affiliations:** a list with accept/reject.
  - **Jobs:** list, detail, apply, and "my applications".
- Instantiate `DioJobPostingRepository` in the stylist app services and use only the barber-facing methods.

## Acceptance Criteria
- [x] Repository tests assert the exact method + path for each new call (cancel = `POST`, schedule = `GET`/`PATCH`, portfolio = `GET`/`POST`/`DELETE`, travel radius = `PATCH`, affiliations, jobs).
- [x] Bloc test: cancel sends a non-empty `reason` and removes the booking from today's list on success.
- [x] Widget test: the portfolio grid adds a photo after a mocked upload and removes it after a mocked delete.
- [x] Bloc test: applying to a job twice surfaces the backend error and does not duplicate the local list.
- [x] No stylist-app code calls `PUT /applications/{application}/status` (grep).
- [x] `melos run analyze` and `melos run test` pass.

### Implemented contract
- Shared code path: `StylistOperationsRepository` (core) for cancel, schedule, portfolio and travel radius; the existing `DioAffiliationRepository` and `DioJobPostingRepository` for affiliations and jobs (barber-facing methods only).
- Scope of the rule: cancel is offered for `pending` and `confirmed` bookings; schedule saves only active days (backend replaces the whole week and requires at least one entry).
- Request: `POST barber/bookings/{id}/cancel {cancellation_reason}`; `GET|PATCH barber/schedule {schedule:[{day_of_week,start_time,end_time,is_active}]}`; `GET|POST(multipart photo) barber/portfolio`; `DELETE barber/portfolio/{photo}`; `PATCH barber/travel-radius {travel_radius}`; bio via `PATCH barber/profile`.
- Failure: backend errors surface in the bloc state; lists are left unchanged (a second apply returns 422 and adds nothing).
- Success: cancel removes the booking from today's list; upload appends and delete removes a portfolio photo.
- Mobile: `packages/core` (endpoints, `BarberScheduleDayDto`, `PortfolioPhotoDto`, repository), `packages/localization` (EN/AR), `apps/stylist_app` (schedule, portfolio, profile, affiliations, jobs, cancel sheet, `AppRoutes`, `StylistFeatureBlocs`). Backend and dashboard: unchanged.
- Deviations from the original spec text: request field is `cancellation_reason`, not `reason` (T83-2). No "request affiliation" UI: it needs a branch picker that no endpoint supports; the repository method exists. Bio is write-only (the profile exposes only the active locale), so blank locales are left untouched.

## Out of Scope
- Stylist login/router (Task 82).
- Branch-side affiliation and job management (Task 85).

> Note (Task 40): the client-review contract is ready — `rateClient` on `StylistOperationsRepository` in `packages/core`, and staff booking payloads carry `client.reputation {average, count}` (`BookingDto.client`, dashboard `IBooking.client`).

> Note (Task 41): barber dispute route is `POST /api/v1/barber/reviews/{review}/dispute`.
