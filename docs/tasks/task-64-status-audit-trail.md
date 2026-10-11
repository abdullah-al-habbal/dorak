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
### Dashboard (BFF / React)
- Add a "History" section on the booking detail page (`app/(portals)/{admin,manager}/bookings/[id]/page.tsx`, wired in Task 70), via a new allowlisted BFF path. Admin sees all bookings; a manager sees only bookings in their own branch.
### Mobile (Flutter / Repositories)
- None. Audit history is an operator concern.

## Acceptance Criteria
- [ ] Every booking transition made through any entry point (client, barber, branch, dashboard, rebook) creates exactly one `status_change_logs` row with the correct `from_status`, `to_status` and actor. Feature test `StatusChangeLogTest` covers all entry points.
- [ ] Affiliation create/accept/reject/terminate each create one log row.
- [ ] A failed transition (422/409) creates no log row, because the log is written in the same transaction.
- [ ] `GET /api/v1/admin/audit/booking/{id}` returns 200 for `admin_api`, 401 when unauthenticated, and 401 or 403 for client/barber/branch tokens.
- [ ] The dashboard booking detail page renders the history list. A vitest covers the history mapper.
- [ ] `php artisan test` and `npm run test` pass; PHPStan max and Pint are clean for touched backend files; eslint and tsc are clean for the dashboard.

## Out of Scope
- Activation log changes (existing).
- Notification delivery records (Task 30).
