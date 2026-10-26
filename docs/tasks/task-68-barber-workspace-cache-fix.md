# Task 68: Fix Barber Workspace Cache Invalidation and Toggle

**Phase:** Phase 13 — Dashboard · **Priority:** P1 · **Depends on:** None · **Audit source:** Dashboard BFF/UI audit ("Barber workstation toggle / appointment refresh"), verified in session

## Overview & Root Cause
The barber workspace runs its mutations through `useDashboardMutation`, which only invalidates keys under `["dashboard", …]`. The workspace queries are keyed `["barber", …]`, so after accept, cancel or a workstation toggle the lists never refetch and show stale data until the page reloads. The workstation toggle also sends `!online`, where `online` is local state that starts as `false`, instead of negating the server value (`currentOnline`). When the server says the barber is online, pressing "Go offline" sends `online: true`.

## Evidence
- `frontend/dashboard/src/hooks/use-dashboard-mutation.ts:11-14` — invalidates `["dashboard", resource]`, `["dashboard","bookings"]`, `["dashboard","chairs"]` and `["dashboard","overview"]` only.
- `frontend/dashboard/src/components/barber-workspace/barber-workspace.tsx:20-22` — queries keyed `["barber","appointments","today"]`, `["barber","profile"]` and `["barber","portfolio"]`.
- `barber-workspace.tsx:23` — `useDashboardMutation("barber-workstation", () => updateBarberWorkstation(!online))`.
- `barber-workspace.tsx:25` — `currentOnline = profile.data?.workstationOnline ?? online` is used for display but not for the payload.

## Full-Stack Scope
### Backend (API / DB / Policies)
- None. `PATCH /api/v1/barber/workstation-status` and the transition routes behave correctly.
### Dashboard (BFF / React)
- Add a barber-scoped mutation hook, e.g. `hooks/use-barber-mutation.ts`, that invalidates `["barber","appointments"]` (appointment transitions and cancel) or `["barber","profile"]` (workstation).
- Workstation mutation sends `{ online: !currentOnline }`. Remove the local `online` state, or sync it from `profile.data`.
- Keep `use-barber-channel.ts` invalidations (`["barber","appointments"]` and `["barber","profile"]`) aligned with the same keys.
### Mobile (Flutter / Repositories)
- None — the stylist app has its own implementation (Task 83).

## Acceptance Criteria
- [x] After a successful accept or cancel, `["barber","appointments","today"]` is invalidated. New `hooks/use-barber-mutation.ts` invalidates `["barber", resource]`, and `transition`/`cancel` in `barber-workspace.tsx` pass `"appointments"`, which is a valid-prefix match for `["barber","appointments","today"]` under TanStack Query's default partial-key invalidation. `tests/hooks/use-barber-mutation.test.ts` asserts `invalidateQueries` is called with `queryKey: ["barber","appointments"]`.
- [x] After a workstation toggle, `["barber","profile"]` is invalidated. `workstation` passes `"profile"` to the new hook; asserted in the same test file.
- [x] With `profile.data.workstationOnline === true`, pressing the toggle sends a PATCH body `{"online":false}`. Fixed the inversion bug: the mutation now reads `!currentOnline` (the server value) instead of `!online` (local state that always started `false`). `tests/components/barber-workspace/barber-workspace.test.tsx` renders the real component with a mocked profile query and asserts `updateBarberWorkstation` is called with `false` (online case) and `true` (offline case).
- [x] No barber-workspace mutation uses `useDashboardMutation`. All three (`workstation`, `transition`, `cancel`) now use `useBarberMutation`; the now-redundant local `online` state (`useState`) was removed since `profile.data.workstationOnline`, refetched after every mutation, is the single source of truth.
- [x] `npm run test`, `npm run lint` and `npm run typecheck` pass. Also ran `npm run build` (not explicitly required by this AC but required by the monorepo task executor's Dashboard gate set) — green.

## Out of Scope
- New workspace features (start/complete/no-show buttons, schedule, portfolio): Task 69.
