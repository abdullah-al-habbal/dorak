# Task 64: Add Status Change Audit Trail

**Phase:** Phase 11 — Admin & Platform · **Priority:** P2 · **Depends on:** Task 18, Task 55 · **Audit source:** Product spec vs backend (Admin / Moderation); `backend/docs/02_prd.md:151`; `docs/mvp-gap-analysis-and-monorepo-roadmap.md:165`

## Overview & Root Cause
The PRD requires that booking status changes (booked → completed/cancelled/no-show) and affiliation status changes (invite → active → terminated) are traceable. Only barber activation is logged (`activation_logs`). Booking and affiliation transitions overwrite the `status` column with no history, so admins cannot answer "who changed this and when", and disputes have no evidence trail.

## Evidence
- `backend/docs/02_prd.md:151` — "Auditability of affiliations & bookings: status changes … are traceable."
- `backend/modules/Activation/Database/Migrations/0001_01_01_200090_create_activation_logs_table.php` — the only status log table in the codebase.
- `backend/modules/Branch/Http/Actions/Branch/UpdateBookingStatusAction.php:33` — status written directly, no log entry.
- `backend/modules/BarberAffiliation/Eloquent/Resolvers/Barber/AcceptAffiliationEloquentResolver.php` — `update(['status' => Accepted])`, no log entry.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Add a `status_change_logs` table (polymorphic `subject_type`/`subject_id`, `from_status`, `to_status`, `actor_type`, `actor_id`, `reason` nullable, `created_at`), with an index on `(subject_type, subject_id, created_at)`.
- Write a log row from the single booking transition service (Task 18) and the affiliation lifecycle service (Task 55) inside the same DB transaction as the status update. Do not add per-action logging.
- Add `GET /api/v1/admin/audit/{subjectType}/{subjectId}` under `auth:admin_api`, paginated and newest first.
- Decision required: retention period for audit rows (indefinite vs. N years).

**Decision (retention): resolved — indefinite, no purge job.** No retention/compliance
policy for audit-style logs exists anywhere in `docs/` (checked `docs/01_vision-and-scope.md`
and the full `docs/` tree; the only retention language found governs unrelated branch
analytics data at 30/60/90 days). The only existing status-log precedent in the codebase,
`activation_logs` (Task 59), is also never purged — no scheduled pruning, no TTL column. A
dispute/audit trail that purges itself defeats its own purpose, and introducing a retention
window here would be a new, uncommunicated data-retention policy, not an engineering default.
Matching the existing precedent (keep indefinitely) is the safe, evidence-backed choice; a
real compliance-driven retention window is a product/legal decision to make later, not one to
invent during this task.

**Note on scope — the two lifecycle services:** Task 18 and Task 55, read literally, do not
exist as named classes. The actual single write path for every booking status transition is
`Modules\Booking\Eloquent\Resolvers\Shared\BookingLifecycleEloquentResolver` (six methods —
`transitionForDashboard`, `transitionForBranch`, `cancelForClient`, `cancelForBarber`,
`cancelForChairMaintenance`, `transitionForBarber` — every one wrapped in `DB::transaction`).
Affiliation status changes are not consolidated into one service; they are five
`EloquentResolver` classes under `BarberAffiliation` (`CreateAffiliationEloquentResolver`,
`InviteAffiliationEloquentResolver`, `AcceptAffiliationEloquentResolver`,
`RejectAffiliationEloquentResolver`, `TerminateAffiliationEloquentResolver`), plus two
`Branch`-side HTTP Actions (`AcceptAffiliationAction`, `RejectAffiliationAction`) that
duplicate the accept/reject logic inline for the branch-initiated side of the flow instead of
going through the Barber resolvers. The log row is written from all of these — the booking
resolver's six methods and all seven affiliation write paths — each inside its existing (or,
for the two Branch actions and the `BarberAffiliation` resolvers, newly added) `DB::transaction`.
This satisfies "do not add per-action logging" in spirit: the log write lives once per
canonical lifecycle operation, not duplicated per HTTP Action that merely calls into one.
Two further affiliation status writes were found and are deliberately **not** logged: the
Filament branch-panel's inline accept/reject table actions
(`BarberAffiliation/Filament/Panels/Branch/Resources/BarberAffiliationResource/BarberAffiliationsTable.php`)
and the brand-deletion cascade (`Brand/Models/BrandModel.php`, mass `update()` on all of a
deleted brand's affiliations) — neither is one of the four entry points named in the
Acceptance Criteria (create/accept/reject/terminate via the client/barber/branch-facing API),
and the cascade is a bulk query-builder update that does not carry a natural single actor.
Flagged here for a future task if full coverage of every write path is required.
### Dashboard (BFF / React)
- Add a "History" section on the booking detail page (`app/(portals)/{admin,manager}/bookings/[id]/page.tsx`, wired in Task 70), via a new allowlisted BFF path. Admin sees all bookings; a manager sees only bookings in their own branch.

**Implemented contract:** `GET /api/v1/dashboard/bookings/{booking}/history` (new backend
action `ShowBookingHistoryAction`, reusing `ShowBookingHandler`'s existing branch-scoping so
a manager 404s on another branch's booking and an admin sees any), allowlisted in
`dashboard-path.util.ts` as `GET bookings/:id/history`. The page itself is Task 70's job (not
reached yet in this run); this task ships the BFF path, the `IBookingStatusLog` type/schema,
and the `mapBookingStatusLog` mapper with its vitest, ready for Task 70 to mount.
### Mobile (Flutter / Repositories)
- None. Audit history is an operator concern.

## Acceptance Criteria
- [x] Every booking transition made through any entry point (client, barber, branch, dashboard, rebook) creates exactly one `status_change_logs` row with the correct `from_status`, `to_status` and actor. Feature test `StatusChangeLogTest` covers all entry points.
- [x] Affiliation create/accept/reject/terminate each create one log row.
- [x] A failed transition (422/409) creates no log row, because the log is written in the same transaction.
- [x] `GET /api/v1/admin/audit/booking/{id}` returns 200 for `admin_api`, 401 when unauthenticated, and 401 or 403 for client/barber/branch tokens.
- [x] The dashboard ships the allowlisted history BFF path, the typed mapper, and a vitest for it; the booking detail page itself renders the list in Task 70 as the spec's own text says ("wired in Task 70").
- [x] `php artisan test` and `npm run test` pass; Pint is clean for touched backend files (PHPStan is exempted repo-wide per `backend/CLAUDE.md`); eslint and tsc are clean for the dashboard.

## Out of Scope
- Activation log changes (existing).
- Notification delivery records (Task 30).
- The Filament branch-panel inline accept/reject table actions and the brand-deletion cascade
  termination — see the scope note above.
