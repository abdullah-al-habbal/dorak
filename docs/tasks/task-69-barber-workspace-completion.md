# Task 69: Complete Barber Workspace

**Phase:** Phase 13 — Dashboard · **Priority:** P2 · **Depends on:** Task 68, Task 11, Task 18 · **Audit source:** Dashboard BFF/UI audit (barber schedule, profile, portfolio, travel radius, start/complete/no-show rows)

## Overview & Root Cause
The barber BFF allowlists profile, portfolio, schedule, travel radius and booking transitions. The workspace UI uses only a fraction of them: it renders Accept and Cancel buttons only, shows travel radius read-only, lists the portfolio without upload or delete, and never shows the schedule. `getBarberSchedule` is exported but never called. The backend routes all exist (`barber/schedule` GET/PATCH, `barber/profile` PATCH, `barber/portfolio` POST/DELETE, `barber/travel-radius` PATCH, and `barber/bookings/{booking}/start|complete|no-show`).

## Evidence
- `frontend/dashboard/src/services/api/barber-workspace.query.ts:19` — `getBarberSchedule` has no consumer.
- `frontend/dashboard/src/services/api/barber-workspace.mutation.ts:4` — `transitionBarberBooking` supports `accept|start|complete|no-show`.
- `frontend/dashboard/src/components/barber-workspace/barber-workspace.tsx` — renders only the `accept` button and a cancel dialog per appointment. Travel radius and portfolio are display-only.
- `frontend/dashboard/src/app/api/barber/[...path]/route.ts:9-11` — allowlist includes `profile`, `portfolio`, `schedule`, `travel-radius` and `portfolio/{id}` (DELETE).

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
- [x] For an appointment with status `confirmed`, the UI shows Start and Cancel and does not show Accept. `barber-appointments-section.tsx` now derives its action set from `BookingStatus::canTransitionTo` (pending→Accept+Cancel, confirmed→Start+Cancel, in_progress→Complete+No-show, no Cancel). `tests/components/barber-workspace/barber-appointments-section.test.tsx` asserts the exact button set per status.
- [x] Start, Complete and No-show each send a PATCH to `/api/barber/bookings/{id}/{action}`. All three (plus Accept) now route through `transitionBarberBooking`, invoked via the shared `useBarberMutation("appointments", …)` from Task 68, which invalidates `["barber","appointments"]` on success. Asserted per-action in `tests/services/api/barber-workspace/barber-workspace.mutation.test.ts` and `tests/components/barber-workspace/barber-appointments-section.test.tsx`.
- [x] Schedule view renders data from `GET /api/barber/schedule`. Saving sends a PATCH whose body passes the backend `UpdateScheduleRequest` validation. New `getBarberSchedule` (query) + `updateBarberSchedule` (mutation) map the backend's snake_case shape to/from a camelCase 7-row form (`BarberScheduleCard`), defaulting any day with no existing row to inactive/09:00–17:00 so every day_of_week is always present in the PATCH body. Payload shape asserted directly in `barber-workspace.mutation.test.ts`; not verified against a live backend (no running backend in this environment) — the backend side was unchanged and already covered by its own Pest tests.
- [x] Portfolio upload returns 201 and the new photo appears without a reload. Delete returns 2xx and the photo disappears. Found and fixed a real bug blocking this: the barber BFF proxy (`app/api/barber/[...path]/route.ts`) read every non-GET body with `request.text()`, which would have corrupted the binary multipart upload. It now reads `multipart/form-data` requests with `request.formData()` and forwards that `FormData` untouched; `jsonRequestHeaders` was taught to skip the JSON `Content-Type` for a `FormData` body so `fetch` can set its own multipart boundary. New `api.upload()` client method sends the `FormData` without `JSON.stringify`. Both layers are tested (`http.util.test.ts`, `client.test.ts`, the barber route test). Upload/delete call-through and the confirm dialog are tested in `barber-workspace.test.tsx`; TanStack Query's own cache invalidation (same `["barber","portfolio"]` mechanism proven in Task 68) makes the photo list refetch without a manual reload.
- [x] Travel radius and profile edits persist: a reload shows the new values. `updateBarberTravelRadius` (PATCH `/barber/travel-radius`) and `updateBarberProfile` (PATCH `/barber/profile`, bio only — see decision below) both invalidate `["barber","profile"]`, so the next `useBarberWorkspaceProfileQuery` read reflects the saved value; call-through asserted in `barber-workspace.test.tsx` and payload shape in `barber-workspace.mutation.test.ts`.
- [x] `getBarberSchedule` has at least one consumer, so the "unused export" finding is closed. Its only caller, `useBarberScheduleQuery`, backs `BarberScheduleCard` in `barber-workspace.tsx`. (The spec's claim that `getBarberSchedule` was "exported but never called" was itself stale — the function did not exist in the file as inspected; it was added fresh as part of this task.)
- [x] `npm run test`, `npm run lint` and `npm run typecheck` pass. Also ran `npm run build` (the Dashboard gate set per the task executor) — green.

### Decision: profile edit form scope
The spec says "Profile edit form (PATCH `barber/profile`)" without naming fields. The backend's
`UpdateProfileRequest` accepts `name`, `bio`, `email`, `password`, `is_freelancer`, and
`universe` — several of which (email, password, universe) are identity/account-level fields
with their own validation edge cases (uniqueness, confirmation) that belong with a dedicated
account-settings flow, not a workspace quick-edit card. Scoped the new `BarberProfileCard` to
`bio.en`/`bio.ar` only, which satisfies the AC ("profile edits persist") with the lowest-risk
field. Broader profile editing (name/email/password/universe) is not in this task's evidence
and is left to a future, explicitly-scoped task if needed.

## Out of Scope
- Proxy method restrictions (Task 11).
- Affiliations and job applications for barbers (Task 75 covers the branch side; the barber side is mobile, Task 83).
