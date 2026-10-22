# Task 85: Build Business App Features

**Phase:** Phase 14 — Mobile · **Priority:** P2 · **Depends on:** Task 84 (business shell), Task 18 (centralized booking transitions), Task 27 (chair maintenance conflicts), Task 06 (branch-side application decisions), Task 55 (affiliation lifecycle), Task 56 (job board), Task 51 (storefront fields), Task 40 (two-way reviews) · **Audit source:** Mobile audit — business rows (job postings, floor-plan config, chair toggle, affiliations, profile, reviews, booking status menu)

## Overview & Root Cause
The business app covers only the dashboard, the bookings list, the chairs list and a status menu.
- **No caller:** `branch/job-postings*`, `PATCH branch/floor-plan`, `PATCH branch/chairs/{chair}/status`, `branch/affiliations*`, `branch/profile` and `branch/reviews` have no mobile caller. Job-posting and floor-plan repository methods exist with no callers (the floor-plan method is misplaced in `job_posting.repository.dart`).
- **Status menu:** it offers all four statuses for every booking regardless of the current state, and the backend currently applies them without a transition check.

## Evidence
- `frontend/mobile/apps/business_app/lib/src/features/operations/branch_operations.screen.dart:110-130` — `PopupMenuButton` with four fixed `PopupMenuItem`s calling `bloc.updateBooking(booking.id, status)`.
- `frontend/mobile/apps/business_app/lib/src/features/operations/branch_operations.screen.dart:137-141` — chairs rendered as display-only `ListTile`s.
- `frontend/mobile/packages/core/lib/src/network/repositories/job_posting.repository.dart:9-16` — `getBranchJobPostings`, `saveBranchJobPosting`, `deleteBranchJobPosting`, `getBranchApplications`, `updateBranchFloorPlan`; no callers in `apps/`.
- `backend/modules/Branch/Http/Actions/Branch/UpdateBookingStatusAction.php` — unconditional status update (fixed by Task 18).
- Backend routes (`routes.tsv`): `GET|POST branch/job-postings`, `PUT|DELETE branch/job-postings/{jobPosting}`, `GET branch/job-postings/{jobPosting}/applications`, `PATCH branch/floor-plan`, `PATCH branch/chairs/{chair}/status`, `GET branch/affiliations`, `POST branch/affiliations/{affiliation}/accept|reject`, `GET|PATCH branch/profile`, `GET branch/reviews`.

## Full-Stack Scope
### Backend (API / DB / Policies)
- None new here. Task 18 must reject illegal transitions (expected 422/409), Task 27 defines the maintenance-toggle conflict response, and Task 06 adds the branch-side application status endpoint.

### Dashboard (BFF / React)
- None — the dashboard equivalents are Tasks 74/75.

### Mobile (Flutter / Repositories)
- Move `updateBranchFloorPlan` from `job_posting.repository.dart` into a `BranchManagementRepository`. Add methods for chair status, affiliations, profile and reviews.
- Booking status menu: build the items from the allowed transitions for `booking.status` (mirroring the backend `BookingStatus::canTransitionTo` set from Task 18), and surface backend rejection errors.
- Screens (registered in the Task 84 router):
  - **Chairs:** a chair status toggle on the chairs list, with a conflict dialog for the Task 27 response. *(Delivered in Task 27: `BranchOperationsBloc.updateChairStatus`/`confirmChairMaintenance`, `PendingChairMaintenance` state and the dialog; only verify here.)*
  - **Job postings:** list/create/edit/delete, plus applicants with accept/reject via the Task 06 endpoint.
  - **Floor plan:** a configuration screen.
  - **Affiliations:** inbox with accept/reject.
  - **Branch profile:** an edit form (storefront fields from Task 51).
  - **Reviews:** a list.

## Acceptance Criteria
- [ ] Unit test: for each `BookingStatus`, the menu offers exactly the backend-allowed next statuses (table-driven).
- [ ] Repository tests assert method + path for every new call listed under Evidence.
- [ ] Bloc test: a chair toggle that returns the Task 27 conflict response shows the conflict state and does not change the chair locally.
- [ ] Widget tests: job posting create → appears in the list; affiliation accept → removed from pending.
- [ ] No business-app code calls `job_posting.repository.dart` for floor-plan updates (grep).
- [ ] `melos run analyze` and `melos run test` pass.

## Out of Scope
- Login/router (Task 84).
- Shared floor-plan package decision (Task 86).
