---
nodeid: docs.todowork
parentnode: repo.root
childnodes:
  - docs.graph
  - docs.architecture
  - docs.decisions
codeanchors:
  - backend/
  - frontend/dashboard/
  - frontend/mobile/
---

# Master Monorepo Execution Plan

> Source: monorepo audit of 2026-10-11 (backend routes, backend vs product/feature specs, dashboard BFF/UI, mobile apps).
> Order = execution priority. Respect each spec's **Depends on** line. Tick a box only when every acceptance criterion in the spec passes.
> Open product decisions blocking tasks: [decisions-required.md](decisions-required.md).
> Documentation routes: [repository graph](INDEX.md) · [root orientation](../index.md).

## Phase 1 — Security & Authorization (P0)
- [x] Task 01: Fix Barber Affiliation Ownership Authorization -> [Spec](tasks/task-01-affiliation-ownership.md)
- [x] Task 02: Fix Client History Ownership (Rebook & Media) -> [Spec](tasks/task-02-client-history-ownership.md)
- [x] Task 03: Correct Admin API Authentication Guards -> [Spec](tasks/task-03-admin-api-guards.md)
- [x] Task 04: Restrict Service Catalog Mutations to Admins -> [Spec](tasks/task-04-service-catalog-authorization.md)
- [x] Task 05: Scope Chair Barber Assignment to Branch Affiliations -> [Spec](tasks/task-05-chair-barber-assignment-scope.md)
- [x] Task 06: Move Job Application Decisions to Branch Managers -> [Spec](tasks/task-06-job-application-status-authz.md)
- [x] Task 07: Store Face Photos Privately with Signed Access -> [Spec](tasks/task-07-face-photo-privacy.md)
- [x] Task 08: Enforce Client and Barber Bans at Login and Booking -> [Spec](tasks/task-08-ban-enforcement.md)
- [x] Task 09: Enforce Account Status at Login and Hide Inactive Entities in Explore -> [Spec](tasks/task-09-activation-status-visibility.md)
- [x] Task 10: Harden Dashboard Session Claim (HttpOnly Cookie, jti, Rotation) -> [Spec](tasks/task-10-dashboard-session-hardening.md)
- [x] Task 11: Restrict BFF Catch-All Proxies to Declared Method+Path Pairs -> [Spec](tasks/task-11-bff-proxy-method-allowlist.md)
- [x] Task 12: Enforce Branch Manager Scope and Last-Branch Guard -> [Spec](tasks/task-12-branch-manager-scope.md)

## Phase 2 — Data Integrity & Broken Pipelines (P0)
- [x] Task 13: Fix Booking Completion for Bookings Without a Barber -> [Spec](tasks/task-13-booking-completion-null-barber.md)
- [x] Task 14: Align Service Catalog ID Type with API Contracts -> [Spec](tasks/task-14-catalog-id-contract.md)
- [x] Task 15: Dispatch Face Analysis on Photo Upload -> [Spec](tasks/task-15-face-analysis-dispatch.md)
- [x] Task 16: Migrate Push Delivery to FCM HTTP v1 -> [Spec](tasks/task-16-fcm-http-v1.md)
- [x] Task 17: Backfill Feature Tests for Uncovered Routes -> [Spec](tasks/task-17-backfill-feature-tests.md)

## Phase 3 — Booking Engine (P1)
- [x] Task 18: Centralize Booking Status Transitions -> [Spec](tasks/task-18-booking-lifecycle-service.md)
- [x] Task 19: Route Rebook Through the Booking Engine -> [Spec](tasks/task-19-rebook-via-booking-engine.md)
- [x] Task 20: Unify Availability Semantics and Time Contract -> [Spec](tasks/task-20-availability-semantics.md)
- [x] Task 21: Add Slot Availability Endpoint -> [Spec](tasks/task-21-slot-availability-endpoint.md)
- [x] Task 22: Validate Bookings Against Branch Hours and Barber Schedule -> [Spec](tasks/task-22-booking-hours-schedule-validation.md)
- [x] Task 23: Validate Service Ownership and Resolve Chair Barber on Booking -> [Spec](tasks/task-23-booking-service-ownership.md)
- [x] Task 24: Allow Booking a Shop Barber Without Picking a Chair -> [Spec](tasks/task-24-barber-booking-without-chair.md)
- [x] Task 25: Enforce At-Home Booking Rules -> [Spec](tasks/task-25-at-home-booking-rules.md)
- [x] Task 26: Fix Client Booking List Status Buckets -> [Spec](tasks/task-26-client-booking-list-statuses.md)
- [x] Task 27: Handle Chair Maintenance Conflicts with Existing Bookings -> [Spec](tasks/task-27-chair-maintenance-conflicts.md)

## Phase 4 — Notifications & Realtime (P1)
- [x] Task 28: Notify on Every Booking Transition -> [Spec](tasks/task-28-booking-notification-coverage.md)
- [x] Task 29: Add Client Realtime Booking Channel -> [Spec](tasks/task-29-client-realtime-channel.md)
- [x] Task 30: Persist Notification Delivery Records -> [Spec](tasks/task-30-notification-delivery-records.md)
- [x] Task 31: Notify on Invitations, Applications and Review Requests -> [Spec](tasks/task-31-domain-event-notifications.md)

## Phase 5 — Auth & Account (P1)
- [x] Task 32: Add Client Profile Read Endpoint and Session Restore -> [Spec](tasks/task-32-client-profile-endpoint.md)
- [x] Task 33: Complete Auth Payload and Email Re-verification -> [Spec](tasks/task-33-auth-payload-email-reverification.md)
- [x] Task 34: Implement Phone OTP Verification -> [Spec](tasks/task-34-phone-otp-verification.md)
- [x] Task 35: Verify Password Recovery Code Server-Side -> [Spec](tasks/task-35-password-recovery-code-verification.md)
- [x] Task 36: Enforce Account Deletion Rules and History Anonymization -> [Spec](tasks/task-36-account-deletion-rules.md)
- [x] Task 37: Implement Barber Self Sign-Up -> [Spec](tasks/task-37-barber-self-signup.md)
- [x] Task 38: Implement Brand Owner Role -> [Spec](tasks/task-38-brand-owner-role.md)

## Phase 6 — Reviews (P1)
- [x] Task 39: Resolve Review Subject for Barber and At-Home Bookings -> [Spec](tasks/task-39-review-subject-resolution.md)
- [x] Task 40: Implement Two-Way Reviews and Client Reputation -> [Spec](tasks/task-40-two-way-reviews-reputation.md)
- [x] Task 41: Complete Review Dispute Workflow -> [Spec](tasks/task-41-review-dispute-workflow.md)

## Phase 7 — Discovery (P1)
- [x] Task 42: Compute and Expose Branch and Barber Ratings -> [Spec](tasks/task-42-entity-rating-aggregates.md)
- [x] Task 43: Add Explore Text Search -> [Spec](tasks/task-43-explore-text-search.md)
- [x] Task 44: Support Unisex Universe and Barber Universe Filter -> [Spec](tasks/task-44-universe-unisex-and-barber-filter.md)
- [x] Task 45: Include Freelancers in Search Results -> [Spec](tasks/task-45-freelancers-in-search.md)
- [x] Task 46: Apply Composite Ranking Before Pagination -> [Spec](tasks/task-46-composite-ranking-ordering.md)
- [x] Task 47: Apply Discovery Preferences and Log Interactions -> [Spec](tasks/task-47-discovery-preferences-and-interaction-logging.md)
- [x] Task 48: Complete Branch and Barber Detail Payloads -> [Spec](tasks/task-48-branch-barber-detail-completeness.md)

## Phase 8 — Brand, Branch & Barber Platform (P2)
- [x] Task 49: Apply Brand Creation Defaults -> [Spec](tasks/task-49-brand-creation-defaults.md)
- [x] Task 50: Implement Brand Feature Flags -> [Spec](tasks/task-50-brand-feature-flags.md)
- [x] Task 51: Add Branch Storefront Fields and Opening Hours -> [Spec](tasks/task-51-branch-storefront-fields.md)
- [x] Task 52: Expose Settings and Preferences API -> [Spec](tasks/task-52-settings-preferences-api.md)
- [x] Task 53: Complete Activation Management -> [Spec](tasks/task-53-activation-management.md)
- [x] Task 54: Add Barber Bio and Self-Service Services API -> [Spec](tasks/task-54-barber-profile-and-services-api.md)
- [x] Task 55: Complete Affiliation Lifecycle -> [Spec](tasks/task-55-affiliation-lifecycle.md)
- [x] Task 56: Complete Job Board -> [Spec](tasks/task-56-job-board-completion.md)

## Phase 9 — Currency (P2)
- [x] Task 57: Open Currency Conversion to Clients and Convert Prices -> [Spec](tasks/task-57-currency-client-conversion.md)

## Phase 10 — Client Intelligence (P2)
- [x] Task 58: Complete Client History -> [Spec](tasks/task-58-client-history-completion.md)
- [x] Task 59: Enforce Face Profile Photo Lifecycle -> [Spec](tasks/task-59-face-profile-lifecycle.md)
- [x] Task 60: Fix Favorites and Saved Filter Contracts -> [Spec](tasks/task-60-favorites-and-saved-filters-contract.md)
- [x] Task 61: Complete Service Catalog Module -> [Spec](tasks/task-61-service-catalog-completion.md)
- [x] Task 62: Fix Recommendation Pipeline -> [Spec](tasks/task-62-recommendation-pipeline-fixes.md)
- [x] Task 63: Provision pgvector Storage for Preference Vectors -> [Spec](tasks/task-63-pgvector-storage.md)

## Phase 11 — Admin & Platform (P2–P3)
- [x] Task 64: Add Status Change Audit Trail -> [Spec](tasks/task-64-status-audit-trail.md)
- [x] Task 65: Specify and Build Monetization and Analytics APIs -> [Spec](tasks/task-65-monetization-analytics-apis.md) — approved with a dynamic zero-hardcoding model (plans, gateways, commission rules, payouts, analytics); backend modules, dashboard admin pages and tests shipped.

## Phase 12 — Backend Hygiene (P3)
- [x] Task 66: Remove Orphan Action Classes -> [Spec](tasks/task-66-orphan-actions-cleanup.md)
- [x] Task 67: Conform Modules to Context Namespacing -> [Spec](tasks/task-67-context-namespacing-conformance.md)

## Phase 13 — Dashboard (P1–P2)
- [x] Task 68: Fix Barber Workspace Cache Invalidation and Toggle -> [Spec](tasks/task-68-barber-workspace-cache-fix.md)
- [x] Task 69: Complete Barber Workspace -> [Spec](tasks/task-69-barber-workspace-completion.md)
- [x] Task 70: Wire Booking Detail Page and Full Status Set -> [Spec](tasks/task-70-booking-detail-and-status.md)
- [x] Task 71: Enable List Search and Filters -> [Spec](tasks/task-71-list-search-filters.md)
- [x] Task 72: Replace Portal Home Placeholders and Fix Overview -> [Spec](tasks/task-72-portal-home-and-overview.md)
- [x] Task 73: Implement Dashboard Token Refresh Flow -> [Spec](tasks/task-73-dashboard-token-refresh.md)
- [x] Task 74: Add Branch Operations BFF and UI -> [Spec](tasks/task-74-branch-operations-bff-ui.md)
- [x] Task 75: Add Branch People BFF and UI (Affiliations, Jobs, Barbers) -> [Spec](tasks/task-75-branch-people-bff-ui.md)
- [x] Task 76: Add Admin Moderation UI -> [Spec](tasks/task-76-admin-moderation-ui.md)
- [x] Task 77: Add Brand and Service Catalog Management UI -> [Spec](tasks/task-77-catalog-brand-management-ui.md)

## Phase 14 — Mobile (P1–P2)
- [x] Task 78: Fix Client Booking Flow Defects -> [Spec](tasks/task-78-client-booking-flow-fixes.md)
- [x] Task 79: Add Client Barber Discovery and Direct Booking -> [Spec](tasks/task-79-client-barber-discovery.md) — [NEEDSHIL] freelancer-only booking entry pending a product decision
- [x] Task 80: Wire Unwired Client Features -> [Spec](tasks/task-80-client-unwired-features.md) — [NEEDSHIL] hide-brand source and history photo type pending product input; client dispute dropped (Task 41)
- [x] Task 81: Clean Up Client Auth Flows -> [Spec](tasks/task-81-client-auth-cleanup.md) — [NEEDSHIL] social login provider buttons pending a product decision (providers/SDKs)
- [x] Task 82: Build Stylist App Shell (Login, Router, Session) -> [Spec](tasks/task-82-stylist-app-shell.md)
- [x] Task 83: Build Stylist App Features -> [Spec](tasks/task-83-stylist-app-features.md)
- [x] Task 84: Build Business App Shell (Login, Router, Session) -> [Spec](tasks/task-84-business-app-shell.md)
- [x] Task 85: Build Business App Features -> [Spec](tasks/task-85-business-app-features.md)
- [x] Task 86: Clean Up Shared Mobile Packages -> [Spec](tasks/task-86-mobile-shared-packages-cleanup.md)

## Phase 15 — Documentation (P3)
- [x] Task 87: Reconcile Spec and Status Docs with Code -> [Spec](tasks/task-87-docs-drift-reconciliation.md)
