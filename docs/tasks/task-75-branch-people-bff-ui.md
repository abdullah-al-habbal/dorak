# Task 75: Add Branch People BFF and UI (Affiliations, Jobs, Barbers)

**Phase:** Phase 13 — Dashboard · **Priority:** P2 · **Depends on:** Task 01, Task 06, Task 11, Task 55, Task 56 · **Audit source:** Dashboard BFF/UI audit (branch affiliations, job postings, managed barber creation — no proxy, no UI)

## Overview & Root Cause
Branch managers can accept or reject affiliations, manage job postings, review applicants and create managed barbers through the backend, but none of these flows exist in the dashboard. Hiring and staffing happen only through the API or Filament. These flows also depend on authorization fixes (Tasks 01 and 06) and lifecycle completion (Tasks 55 and 56). Building UI before them would expose broken rules, which is why this task comes after them.

## Evidence
- `backend/modules/Branch/Routes/Api/V1/branch.php:35-46` — `POST barbers`, `GET affiliations`, `POST affiliations/{affiliation}/accept|reject`, `GET|POST job-postings`, `PUT|DELETE job-postings/{jobPosting}`, `GET job-postings/{jobPosting}/applications`.
- `backend/modules/Dashboard/Routes/Api/V1/dashboard.php:86-90` — dashboard `stylists` CRUD already exists (it overlaps `POST branch/barbers`).
- `frontend/dashboard/new/src/services/api/dashboard/dashboard-resource.constant.ts` — no proxy root for any of these.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Decision required: managed barber creation. Use only the existing dashboard `stylists` create, or keep `POST branch/barbers`, but not both. If `stylists` covers it, `branch/barbers` becomes mobile-only (Task 85).
- Application status change must be the branch-side endpoint from Task 06 (not `auth:barber`).
- Same proxy-vs-dashboard-module decision as Task 74. Apply one choice to both tasks.
### Dashboard (BFF / React)
- Affiliations page: list with status filter; Accept and Reject with confirmation; Terminate (after Task 55); and a shop-side Invite barber action (after Task 55).
- Job postings: list, create, edit and delete forms with zod schemas mirroring the backend requests; an applicants list per posting; and an application status change.
- Query keys `["dashboard","affiliations"]`, `["dashboard","job-postings"]` and `["dashboard","job-postings",id,"applications"]`. Accepting an affiliation also invalidates `["dashboard","stylists"]` and `["dashboard","chairs"]`.
- Add nav entries in `PORTAL_NAVIGATION`.
### Mobile (Flutter / Repositories)
- None. The business app equivalents are in Task 85.

## Acceptance Criteria
- [ ] Manager accepts a pending affiliation for their branch: 200, and the status shows accepted without a reload. Accepting another branch's affiliation returns 403 (from Task 01, re-asserted in a dashboard feature test).
- [ ] Job posting create, edit and delete round-trip with 201, 200 and 204/200. Validation errors render per field.
- [ ] Applicants list shows the snapshot fields defined in Task 56. A status change returns 200 and is rejected with 403 for a non-owning branch.
- [ ] Only one managed-barber creation path is exposed in the dashboard.
- [ ] BFF declares exact method+path pairs only. Vitest.
- [ ] `php artisan test` and `npm run test` pass; eslint and tsc are clean.

## Out of Scope
- Barber-side affiliation and job flows (Task 83).
- Notifications for invites and applications (Task 31).
