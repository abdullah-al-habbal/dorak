---
nodeid: docs.gap_analysis
parentnode: docs.graph
childnodes:
  - docs.architecture
  - docs.remediation
codeanchors:
  - backend/modules/
  - frontend/dashboard/src/
  - frontend/mobile/apps/
---

# MVP Gap Analysis and Monorepo Roadmap

> Audit snapshot: all planned tasks (1–87) are complete. Route to maintained project docs through the [documentation graph](INDEX.md).

## Scope and audit status

This began as a read-only audit of the existing `backend` Laravel service and
the `frontend/mobile` Flutter workspace. Phase 1 of the migration roadmap was
subsequently executed locally; no application behavior was changed as part of
that phase.

The reservation core is substantially implemented, but the ecosystem is not
yet end-to-end MVP-ready for the requested payment, live-tracking, push
notification, and web-dashboard workflows.

### Phase 1 execution record (2026-09-30)

- Checkpoint commits were created locally before migration:
  - Backend: `5f20c03`
  - Mobile: `ce6e3f1`
- Complete, verified local history bundles were created at the workspace root:
  - `dorak-backend-pre-migration.bundle` (4.1 MB)
  - `dorak-mobile-pre-migration.bundle` (41 MB)
- The repositories were moved to `backend/` and `frontend/mobile/` while
  retaining their nested `.git` directories and independent history.
- `frontend/dashboard/` was created as the dashboard placeholder.
- Path documentation was updated and committed locally:
  - Backend: `598041e`
  - Mobile: `3850c55`
- `dart run melos run analyze` passes from `frontend/mobile/`.
- `php artisan about --only=environment` boots successfully from `backend/`.
- `php artisan test` is currently blocked by an unavailable MySQL test database
  at `127.0.0.1:3306`, database `dorak_test`; all 505 tests fail before making
  assertions. This is an environment prerequisite, not a migration failure.

## 1. Monorepo restructuring guidance

The workspace root is not a Git repository. `backend/` and
`frontend/mobile/` are separate nested Git repositories, and both have
uncommitted work. Do not use `git mv` from the workspace root or remove nested
`.git` directories before deciding how their history will be preserved.

First, commit or otherwise preserve current changes in each repository and
create Git bundles:

```bash
git -C backend status --short
git -C frontend/mobile status --short

git -C backend bundle create ../dorak-backend-pre-migration.bundle --all
git -C frontend/mobile bundle create ../../dorak-mobile-pre-migration.bundle --all
```

After both repositories are clean and backed up, this changes the physical
layout while preserving their independent Git repositories:

```bash
mkdir -p frontend
mv dorak-backend backend
mv dorak-mobile frontend/mobile
mkdir -p frontend/dashboard docs
```

This yields the desired directory structure but remains a multi-repository
workspace. To create a true single-Git monorepo, import each repository's
history into a new root repository with `git filter-repo` or subtree imports.
That choice changes repository ownership and history, so it requires an
explicit migration decision.

Known path references to update after the move include:

- `index.md`
- `docs/actionable-plan.md`
- `frontend/mobile/AGENTS.md`
- historical frontend references in `backend/AGENTS.md`
- `backend/.github/workflows/deploy.yml`

`frontend/dashboard/` does not currently exist.

## 2. Backend and database deficiency report

| Severity | Finding | Evidence and impact |
| --- | --- | --- |
| CRITICAL | Payment is not implemented despite a mobile online-payment option. | There is no payment module, transaction schema, provider integration, webhook handler, or idempotency record. `modules/Booking/Http/Requests/Client/CreateBookingRequest.php` accepts no payment data. The current backend PRD explicitly treats MVP bookings as reservations, not transactions. |
| CRITICAL | No push-notification delivery pipeline exists. | No FCM/Firebase dependency, device-token schema, notification queue/job, or booking-transition notification was found. This blocks reliable stylist notification and background live tracking. |
| HIGH | Booking state transitions are not a state machine. | `modules/Branch/Http/Actions/Branch/UpdateBookingStatusAction.php` accepts `in_progress`, `completed`, `no_show`, or `cancelled` from any current status. It does not check predecessors or use a conditional state update. |
| HIGH | The requested `Pending -> Confirmed` lifecycle does not exist. | `modules/Booking/Enums/BookingStatus.php` has no `pending`; `CreateBookingEloquentResolver` creates a booking directly as `confirmed`. This needs a product decision before online payments are introduced. |
| HIGH | Stylist-controlled accept/start/complete workflow is absent. | The stylist API exposes only today's appointments and workstation status. Booking status mutation is branch-guarded at `PATCH /branch/bookings/{booking}/status`; no barber transition endpoint exists. |
| HIGH | Role boundaries are inconsistent for write operations. | `modules/Chair/Routes/Api/V1/chairs.php` protects chair mutation with `auth:client`; `modules/ServiceCatalog/Routes/Api/V1/service-catalog.php` does the same for catalog mutation. These should be branch/manager/admin capabilities. |
| HIGH | Current availability is not selected-slot availability. | `modules/Branch/Eloquent/Resolvers/Shared/GetFloorPlanEloquentResolver.php` returns only chairs occupied at `now()` and only by confirmed bookings. It cannot answer availability for a requested future interval and ignores in-progress sessions. |
| HIGH | Real-time is only partially scaffolded and has no mobile consumer. | `modules/Chair/Events/ChairStatusUpdated.php` is the one broadcast event found. There are no booking events, authenticated/private channels, Flutter socket consumers, or reconnect/resync behavior. |
| MEDIUM | Double-booking prevention is application-level rather than a database invariant. | Booking creation correctly uses a transaction and `lockForUpdate()` on service/chair/barber rows; interval indexes exist. At-home bookings without a barber have no constrained capacity resource. |
| MEDIUM | A chair booking can be made without a stylist; an at-home booking can be made without chair or stylist. | `CreateBookingRequest.php` makes `barber_id` optional. This conflicts with the requested service/stylist/chair journey unless intentional. |
| MEDIUM | Status updates can race with cancellation and other status updates. | The branch update is an unconditional model update rather than a locked or expected-state conditional transition. |
| MEDIUM | Dashboard authorization API is missing. | Client, barber, and branch have Sanctum guards, while admin is session-based. No audited REST group supports Super Admin dashboard actions for subscriptions, payouts, commissions, or platform analytics. |
| MEDIUM | Core commercial entities are absent. | Brands, branches, chairs, services, and bookings exist. Payments, transactions, subscriptions, platform commissions, payouts, device registrations, and notification deliveries do not. |
| LOW | Atomic completed-booking history creation is not evident in the operational update path. | The direct branch status update does not show a history side effect or transaction. Verify the documented behavior with integration tests. |

## 3. Mobile integration audit

Production Flutter code predominantly uses repository interfaces with `Dio`
implementations. The discovered fakes are test-only; no production screen was
found wired to a fake repository.

| App or area | Current integration | Missing or mismatched contract |
| --- | --- | --- |
| Client discovery | Real `DioExploreRepository` is built through `AppServices`. | HTTP only; no real-time updates. |
| Client booking creation | Endpoint and payload align with `POST /bookings`; service IDs and server-derived duration are supported. | No payment intent/session or payment method is sent. |
| Client chair selection | Uses `GET /branches/{branch}/floor-plan`. | It is a current-occupancy snapshot, not selected-time availability; no websocket refresh. |
| Client live tracker | Uses HTTP refresh/polling-oriented state. | No booking-status websocket subscription or FCM handling. |
| Client online-payment UI | Offers pay-at-salon and online-payment choices. | The choice is display-only; there is no checkout handoff or backend payment contract. |
| Business operations | Real branch dashboard, booking, booking-status, and chairs endpoints are wired. | No branch login/onboarding journey, floor-plan editor, service/pricing management, schedule management, or real-time queue updates in the current app flow. |
| Stylist operations | Real `GET /barber/appointments/today` and `PATCH /barber/workstation-status` endpoints are wired. | No stylist login UI, accept/start/complete action, break/schedule management, push, or websocket support. |
| Stylist token handling | The stylist app builds a real API client. | It uses the default client-token storage namespace although its endpoints require the barber guard. This prevents reliable stylist authentication. |
| All apps | No Firebase Messaging, socket, or channel package/wiring exists in production sources or pubspecs. | FCM registration, token rotation, notification routing, websocket auth/reconnect, and resync-on-reconnect are required. |

## 4. Next.js dashboard architecture specification

Create `frontend/dashboard/` as a Next.js App Router application with
TypeScript, Tailwind CSS, Shadcn UI, TanStack Query, TanStack Table, and Zod.

```text
frontend/dashboard/
├── app/
│   ├── (auth)/login/
│   ├── (platform)/
│   │   ├── overview/
│   │   ├── salons/
│   │   ├── subscriptions/
│   │   ├── commissions/
│   │   ├── payouts/
│   │   └── analytics/
│   ├── (manager)/
│   │   ├── branches/
│   │   ├── services/
│   │   ├── staff/
│   │   ├── schedules/
│   │   ├── floor-plan/
│   │   ├── queue/
│   │   └── revenue/
│   └── api/auth/
├── components/
├── features/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── permissions/
│   └── validation/
├── providers/
├── types/
├── middleware.ts
└── package.json
```

Use a backend-for-frontend or auth adapter rather than exposing Laravel
session cookies directly to the browser. The backend must first provide
dashboard-capable, role-scoped API authentication and endpoints. The dashboard
should render from server-issued capabilities rather than independently
implementing authorization rules.

Required API groups:

- Platform: salons/brands, branches, manager assignment, subscriptions,
  commission rules, payouts, and global analytics.
- Manager: branch configuration, floor plan/chairs, service offering prices,
  stylist affiliation/schedules, queue, and revenue.
- Shared: authenticated identity/capabilities, audit log, pagination,
  filtering, and exports.

## 5. Prioritized execution plan

### Phase 0: Preserve and migrate safely

1. Clean or commit both nested repositories.
2. Create Git bundle backups.
3. Choose a physical multi-repo workspace or a true history-preserving Git
   monorepo.
4. Move directories and update documentation, CI paths, local scripts, and
   deployment assumptions.

### Phase 1: Backend and database readiness

1. Decide whether payment belongs in the MVP; current backend documentation
   says it does not.
2. If payment is required, add `pending_payment`, payment intents, provider
   webhooks, idempotency keys, a transaction ledger, and payment-to-booking
   state transitions.
3. Implement a strict transition service with expected-state conditional
   writes and transactional completion side effects.
4. Add role/capability policies and correct client-protected manager writes.
5. Define selected-interval availability and resource-capacity rules for
   at-home appointments.
6. Add booking events, private channels, device-token storage, notification
   jobs, retries, and auditability.

### Phase 2: Dashboard scaffold

1. Initialize the Next.js application after dashboard auth/API contracts are
   defined.
2. Build the shared shell, role guards, API client, error handling, tables,
   and audit-log foundation.
3. Deliver branch operations first; defer billing/payout UI until payment and
   subscription APIs exist.

### Phase 3: Mobile-backend wiring

1. Add proper branch and stylist authentication flows and separate token
   storage.
2. Wire FCM registration and authenticated websocket subscriptions.
3. Replace snapshot floor-plan selection with selected-time availability.
4. Wire stylist accept/start/complete and branch queue actions to the strict
   state machine.
5. Remove or disable online-payment UI until the payment backend is live.

### Phase 4: End-to-end verification

1. Test concurrent booking attempts against the same chair and stylist.
2. Test every valid and invalid lifecycle transition.
3. Test authorization isolation across client, stylist, branch manager, and
   platform admin.
4. Test offline/reconnect behavior, notification delivery, webhook idempotency,
   and dashboard/mobile consistency.
