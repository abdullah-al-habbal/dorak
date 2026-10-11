# Task 69: Complete Barber Workspace

**Phase:** Phase 13 — Dashboard · **Priority:** P2 · **Depends on:** Task 68, Task 11, Task 18 · **Audit source:** Dashboard BFF/UI audit (barber schedule, profile, portfolio, travel radius, start/complete/no-show rows)

## Overview & Root Cause
The barber BFF allowlists profile, portfolio, schedule, travel radius and booking transitions. The workspace UI uses only a fraction of them: it renders Accept and Cancel buttons only, shows travel radius read-only, lists the portfolio without upload or delete, and never shows the schedule. `getBarberSchedule` is exported but never called. The backend routes all exist (`barber/schedule` GET/PATCH, `barber/profile` PATCH, `barber/portfolio` POST/DELETE, `barber/travel-radius` PATCH, and `barber/bookings/{booking}/start|complete|no-show`).

## Evidence
- `frontend/dashboard/new/src/services/api/barber-workspace.query.ts:19` — `getBarberSchedule` has no consumer.
- `frontend/dashboard/new/src/services/api/barber-workspace.mutation.ts:4` — `transitionBarberBooking` supports `accept|start|complete|no-show`.
- `frontend/dashboard/new/src/components/barber-workspace/barber-workspace.tsx` — renders only the `accept` button and a cancel dialog per appointment. Travel radius and portfolio are display-only.
- `frontend/dashboard/new/src/app/api/barber/[...path]/route.ts:9-11` — allowlist includes `profile`, `portfolio`, `schedule`, `travel-radius` and `portfolio/{id}` (DELETE).

## Full-Stack Scope
### Backend (API / DB / Policies)
- None for this task. The routes exist. Feature-test gaps are covered in Task 17.
### Dashboard (BFF / React)
- Appointment actions are status-aware: `pending` → Accept/Cancel; `confirmed` → Start/Cancel; `in_progress` → Complete/No-show. Allowed transitions come from the backend lifecycle (Task 18).
- Schedule panel: read `getBarberSchedule`, edit through a new `updateBarberSchedule` (PATCH) with a zod schema matching the backend request.
- Profile edit form (PATCH `barber/profile`) and travel-radius editor (PATCH `barber/travel-radius`).
- Portfolio upload (POST multipart) and delete (DELETE `portfolio/{id}`) with a confirm dialog.
- Every mutation invalidates the matching `["barber", …]` key (pattern from Task 68).
### Mobile (Flutter / Repositories)
- None. The stylist app equivalents are in Task 83.

## Acceptance Criteria
- [ ] For an appointment with status `confirmed`, the UI shows Start and Cancel and does not show Accept. Covered by a vitest/RTL test per status.
- [ ] Start, Complete and No-show each send a PATCH to `/api/barber/bookings/{id}/{action}`. On 2xx, `["barber","appointments"]` is invalidated.
- [ ] Schedule view renders data from `GET /api/barber/schedule`. Saving sends a PATCH whose body passes the backend `UpdateScheduleRequest` validation (the backend returns 200 in a manual or e2e check).
- [ ] Portfolio upload returns 201 and the new photo appears without a reload. Delete returns 2xx and the photo disappears.
- [ ] Travel radius and profile edits persist: a reload shows the new values.
- [ ] `getBarberSchedule` has at least one consumer, so the "unused export" finding is closed.
- [ ] `npm run test`, `npm run lint` and `npm run typecheck` pass.

## Out of Scope
- Proxy method restrictions (Task 11).
- Affiliations and job applications for barbers (Task 75 covers the branch side; the barber side is mobile, Task 83).
