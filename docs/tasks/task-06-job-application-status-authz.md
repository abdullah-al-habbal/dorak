# Task 06: Move Job Application Decisions to Branch Managers

**Phase:** 1 — Security & Authorization · **Priority:** P0 · **Depends on:** None · **Audit source:** Feature audit BE-08 / `15_post_launch_improvements.md` Step 15; product audit (`06_entity-model-abstract.md:200`, the shop sets application status)

## Overview & Root Cause
`PUT /api/v1/applications/{application}/status` sits behind `auth:barber`. `UpdateApplicationStatusRequest::authorize()` allows **any barber who holds a chair at the posting's branch**. A barber can therefore accept or reject other barbers' applications, including their own. The request also returns `true` when the application does not exist. There are no transition rules either: any `ApplicationStatus` can follow any other.

The branch manager, who owns the decision according to the spec, has a list route (`branch/job-postings/{jobPosting}/applications`) but no route to change a status.

## Evidence
- `backend/modules/JobPosting/Routes/Api/V1/applications.php:9-11`: `auth:barber` group containing `PUT /applications/{application}/status`.
- `backend/modules/JobPosting/Http/Requests/Barber/UpdateApplicationStatusRequest.php:16-28`: returns true when the application is missing; otherwise checks for a chair at the branch held by the current barber.
- `backend/modules/JobPosting/Enums/ApplicationStatus.php:9-12`: `submitted`, `reviewed`, `accepted`, `rejected`.
- `backend/modules/Branch/Routes/Api/V1/branch.php:42-46`: branch (`auth:branch_api`) job-posting CRUD and an applications list exist, but no status route.
- `frontend/mobile/packages/core/lib/src/network/endpoints/job_posting.endpoints.dart:9`: mobile `applicationStatus(id)` targets the barber route.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Add `PATCH /api/v1/branch/job-postings/{jobPosting}/applications/{application}/status` under `auth:branch_api`. Authorize only when `jobPosting.branch_id === auth('branch_api')->id()` and the application belongs to that posting.
- Enforce transitions: `submitted → reviewed | accepted | rejected` and `reviewed → accepted | rejected`. `accepted` and `rejected` are terminal; an invalid transition returns 422.
- Remove the barber route `PUT /applications/{application}/status`, or restrict it to the applicant **withdrawing** their own application.
  - Decision required: does a withdraw status exist? `ApplicationStatus` has no `withdrawn` case today.
- Return 404 (not authorize-true) when the application does not exist.

### Dashboard (BFF / React)
- None in this task. The branch applications UI is Task 75 and will call the new branch route.

### Mobile (Flutter / Repositories)
- `frontend/mobile/packages/core/lib/src/network/repositories/job_posting.repository.dart:8,55`:
  - remove `updateApplicationStatus` from the barber-facing surface, or retarget it to withdraw (per the decision above);
  - add a branch-side method that calls the new branch route (consumed by the business app in Task 85).
- `frontend/mobile/packages/core/lib/src/network/endpoints/job_posting.endpoints.dart`: add the branch application status endpoint constant.

## Acceptance Criteria
- [ ] As any barber, `PUT /api/v1/applications/{id}/status` with `accepted` returns 403 or 404 (or 405 if the route is removed), and the status is unchanged.
- [ ] As the owning branch, `PATCH /api/v1/branch/job-postings/{posting}/applications/{id}/status` with `accepted` returns 200, and the DB shows `accepted`.
- [ ] As a different branch, the same request returns 403.
- [ ] `accepted → submitted` returns 422.
- [ ] A missing application ID returns 404.
- [ ] Feature test `tests/Feature/JobPosting/ApplicationStatusAuthorizationTest.php` covers every case above.
- [ ] `php artisan test` and `melos run test` pass; PHPStan (max) and Pint are clean for touched files.

## Out of Scope
- Application notifications to the shop and the barber: Task 31.
- Profile snapshot content and keeping applications when a branch is deleted: Task 56.
