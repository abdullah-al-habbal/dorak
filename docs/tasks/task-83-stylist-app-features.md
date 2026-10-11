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
- **Decision required:** whether barbers may self activate/deactivate (`barbers/{barber}/activate|deactivate`). Task 53 defines the semantics; do not build UI for it until then.

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
- [ ] Repository tests assert the exact method + path for each new call (cancel = `POST`, schedule = `GET`/`PATCH`, portfolio = `GET`/`POST`/`DELETE`, travel radius = `PATCH`, affiliations, jobs).
- [ ] Bloc test: cancel sends a non-empty `reason` and removes the booking from today's list on success.
- [ ] Widget test: the portfolio grid adds a photo after a mocked upload and removes it after a mocked delete.
- [ ] Bloc test: applying to a job twice surfaces the backend error and does not duplicate the local list.
- [ ] No stylist-app code calls `PUT /applications/{application}/status` (grep).
- [ ] `melos run analyze` and `melos run test` pass.

## Out of Scope
- Stylist login/router (Task 82).
- Branch-side affiliation and job management (Task 85).
