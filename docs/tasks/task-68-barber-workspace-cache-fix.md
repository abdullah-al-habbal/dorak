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
- [ ] After a successful accept or cancel, `["barber","appointments","today"]` is invalidated. A vitest with a mocked `QueryClient` asserts `invalidateQueries` is called with `queryKey: ["barber","appointments"]`.
- [ ] After a workstation toggle, `["barber","profile"]` is invalidated.
- [ ] With `profile.data.workstationOnline === true`, pressing the toggle sends a PATCH body `{"online":false}`. A vitest asserts the request body.
- [ ] No barber-workspace mutation uses `useDashboardMutation`.
- [ ] `npm run test`, `npm run lint` and `npm run typecheck` pass.

## Out of Scope
- New workspace features (start/complete/no-show buttons, schedule, portfolio): Task 69.
