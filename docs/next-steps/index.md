---
nodeid: docs.next_steps
parentnode: docs.graph.part-3
childnodes:
  - docs.next_steps.decisions
  - docs.next_steps.phase_1
  - docs.next_steps.phase_2
  - docs.next_steps.phase_3
  - docs.next_steps.phase_4
  - docs.next_steps.phase_5
  - docs.next_steps.phase_6_7
  - docs.next_steps.coverage
  - docs.next_steps.audit_registration_errors
codeanchors:
  - backend/modules/
  - frontend/web/dashboard/src/
  - frontend/mobile/apps/
---

# Next Steps: Launch Roadmap

Routes: [documentation graph](../index.md) · [open decisions](../decisions-required.md) · [feature modules plan](../feature-modules-plan.md).

This plan merges three read-only studies from 2026-11-09: what each guard can do today, what each guard lacks against the backend, and the launch priorities. It was re-ranked after the decision to retire Filament.

Evidence:

- `backend/modules/Dashboard/Routes/Api/V1/dashboard.php` and the other module route files;
- the database migrations (every `Schema::create`);
- the dashboard's proxy allow-list (`src/config/proxy-allow-list.constant.ts`) and navigation (`src/config/nav.constant.ts`);
- the 23 Filament resources being replaced;
- the feature folders of the three mobile apps.

## Ground rules

- **Filament is retired** ([D1](01-decisions.md#d1-filament-is-retired)). The Next.js dashboard is the only web surface for every guard, including the whole admin back office: users, reference data, moderation and money. No task may rely on Filament, and Filament is removed last ([NS-28](07-phase-6-7-growth-and-retirement.md#ns-28-retire-filament)).
- **The mobile apps keep their scope.** Clients book in `client_app`. Stylists keep full self-service in `stylist_app`: services, portfolio, invitations and jobs. `business_app` mirrors the manager.
- **Order rule:** a guard must never hit a dead end before another guard gains a convenience. The phases are:
  1. nobody is locked out;
  2. the platform team can run the platform alone;
  3. the daily routine needs no workaround;
  4. staffing and signature features;
  5. reference data and money;
  6. growth;
  7. remove Filament.
- **Task IDs are stable.** New tasks get the next free number, and the row order below is the order of work, so IDs are not always sequential.
- **One task is one task-executor run:** the council for medium or complex work, every gate, and one local commit. When the backend is Partial or New, the backend change ships in the same task, following the backend contract policy.

Backend status:

- **Ready:** the dashboard route exists. Only the allow-list rule and the screens are missing.
- **Partial:** the logic exists, but only on a mobile or `admin_api` route or in part, so a dashboard route is needed.
- **New:** no API exists.

Size: S (about a day), M (a few days), L (a week or more).

## Ordered task map

| # | Task | Guards | Backend | Size | Needs | Status |
|---|---|---|---|---|---|---|
| | **[Decisions](01-decisions.md)** (settle before the task that needs them) | | | | | All resolved (D1 to D13) |
| | **[Phase 1: nobody is locked out](02-phase-1-access.md)** | | | | | |
| NS-01 | Password recovery on every login | all | New | M | | Done |
| NS-02 | Account page: profile, email, password, notification settings | all | Ready | M | | Done |
| NS-29 | Error handling and localized error pages (backend and dashboard) | all | Partial | M | D13 (website pages only) | Done |
| NS-03 | Owner public registration, status page, emails, first brand | owner, admin | New | L | D2 (decided), D10, D11, D12 | Done |
| NS-30 | Barber approval queue and sign-up hardening | admin, barber | Partial | M | D8 | Done (no tests, mobile resubmit screen open) |
| NS-04 | Admin users: invite, edit, deactivate | admin | New | M | NS-01 | Done (no tests) |
| | **[Phase 2: the platform team runs the platform alone](03-phase-2-governance.md)** | | | | | |
| NS-05 | Review moderation (disputes) | admin | Ready | S | | Done (no tests) |
| NS-06 | Brand lifecycle: edit, reject and resubmit, suspend, locks, emails, branch status, feature overrides, history | admin | Partial | L | D8, D9 | Done (no tests) |
| NS-07 | Clients and bans | admin | New | L | D4 | Done (no tests) |
| NS-08 | Barbers platform-wide: activation, bans, activation log | admin | Partial | M | NS-07, NS-30 | Done (no tests) |
| NS-09 | Branch-level oversight: chairs, stylists, services, reviews, hours, invitations, jobs | admin | Partial | M | D3 | Done (no tests) |
| | **[Phase 3: the daily routine needs no workaround](04-phase-3-daily-operations.md)** | | | | | |
| NS-10 | Notifications feed in the dashboard | all | New | M | D5 | Todo |
| NS-11 | Rate the client after a visit | manager, owner | Ready | S | | Todo |
| NS-12 | Closure days and special hours | manager, owner | Partial | M | | Todo |
| NS-13 | Owner workspace: brand profile, add a brand, chairs, services, reviews | owner | Ready | M | | Todo |
| NS-14 | Dispute a review from the dashboard | manager, owner | Partial | S | NS-05 | Todo |
| | **[Phase 4: staffing and signature features](05-phase-4-staffing.md)** | | | | | |
| NS-15 | Floor plan editor | manager, owner | Ready | L | | Todo |
| NS-16 | Barber invitations (affiliations) | manager, owner | Ready | M | | Todo |
| NS-17 | Job postings and applications | manager, owner | Ready | M | NS-16 | Todo |
| NS-18 | Per-brand stylist pricing | owner | Ready | M | NS-13 | Todo |
| | **[Phase 5: reference data and money](06-phase-5-reference-and-money.md)** | | | | | |
| NS-19 | Currencies and exchange rates | admin | Partial | M | | Todo |
| NS-20 | Languages | admin | New | S | | Todo |
| NS-21 | Catalog items, tags and media | admin | Partial | M | | Todo |
| NS-22 | Commission rules and ledger | admin | Ready | M | | Todo |
| NS-23 | Payment gateways | admin | Ready | S | | Todo |
| NS-24 | Payout detail | admin, owner | Ready | S | | Todo |
| | **[Phases 6 and 7: growth, then retire Filament](07-phase-6-7-growth-and-retirement.md)** | | | | | |
| NS-25 | Website content: pages, sections, testimonials, onboarding | admin | New | L | D13 | Todo |
| NS-26 | Plan self-service and billing | owner, admin | New | L | D6 | Deferred after launch (D6) |
| NS-27 | Barber web extras | barber | Partial | M | D7 | Closed, no work (D7) |
| NS-28 | Retire Filament | all | Removal | M | NS-01 to NS-24, NS-29, NS-30 | Todo |

Every decision is resolved, so no task is blocked. NS-01, NS-02, NS-03, NS-29, NS-30, NS-04, NS-05, NS-06, NS-07, NS-08 and NS-09 are done; the next task is NS-10.

Phases 1 and 2 are the launch minimum, because without them a guard is locked out or the platform can't be governed. Phase 3 is needed for a smooth first week of real use. Phases 4 to 7 complete the product vision.

What works today, and the Filament-to-task map that proves nothing is lost, are in the [coverage matrix](08-coverage-matrix.md). How each account type joins, the registration edge cases, and the state of error handling are in the [registration and error audit](09-audit-registration-and-errors.md).

## Corrections to the earlier chat reports

- **Notifications are not "backend ready".** The feed routes accept only the mobile guards (`client`, `barber`, `branch_api`). No dashboard route exists, and admins have no feed at all ([NS-10](04-phase-3-daily-operations.md#ns-10-notifications-feed-in-the-dashboard)).
- **No interface can onboard a new owner.** A brand can be created only by a client token (`POST /api/v1/brands`) or by an existing owner on the dashboard. No mobile app calls the create route, and Filament is going away ([NS-03](02-phase-1-access.md#ns-03-owner-self-registration-and-first-brand)).
- **A brand history API exists.** `GET /admin/audit/{subjectType}/{subjectId}` (status-change log) is served on the `admin_api` guard. It needs a dashboard route, not a new design ([NS-06](03-phase-2-governance.md#ns-06-brand-lifecycle)).

## Findings from the registration and error audit (2026-11-09)

Every finding is placed in a task. The evidence is in the [audit](09-audit-registration-and-errors.md).

- **Self-registered barbers can't be approved without Filament.** The activation route is on `admin_api` only → NS-30, in Phase 1.
- **Branch "pending" isn't a gate,** because the owner can set any status → D9, NS-06.
- **No email or notification for submission, approval or rejection;** approval has no row lock → NS-03, NS-06, NS-30, NS-10.
- **Registration edge cases:** a repeat sign-up reveals the email; a soft-deleted email is blocked forever; abandoned sign-ups are kept; a duplicate barber phone is likely a 500; limits are per IP only → NS-03, NS-30, D10, D12.
