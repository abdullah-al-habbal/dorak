# 07 Missing features and unfinished work

Statuses from the handover reconciled on 2026-11-14 at `ff7755c3`. Every item needs backend Pest, dashboard Vitest and
Playwright, and mobile sync when a contract changes.

> Batch 2 (undefined, including the planned "Batch 2 mobile fix") is outside scope under D-03 ([04](04-decisions-and-open-questions.md) E).

## WP-4 Mobile features (not started)
- NS-30 barber resubmit screen in `stylist_app` (rejection reason and resubmission cap).
- Notification deep links for invites and applications must open `/affiliations` and `/jobs/:id/applicants`, not `/operations` or `/home`.
- Re-audit the mobile apps against the `admin_api` routes the dashboard replaced (Activation, Audit, Brand features); unblocks WP-8 and the route removal in WP-7.
- Tests for each; gate `cd frontend/mobile && dart run melos run verify`.

## WP-6 Dashboard "Not done" features (not started)
- NS-10 full notifications page with paging (bell shows the latest 20).
- NS-09 paging inside the oversight dialog; NS-07 paging of bookings and reviews (latest 20 only).
- NS-08 reason prompt on deactivation; ending a barber's affiliation from the dashboard.
- NS-12 date ranges and recurring closures. NS-13 logo upload and universe on brand create.
- NS-15 draggable zones; set a chair's zone from the editor.
- NS-16 and NS-17 manual control for the "seen" application state.
- NS-21 catalog media upload (needs a multipart path through the proxy) and the attributes the phase file lists as not done.
- NS-25 onboarding image upload, create and delete of pages and sections, an editor friendlier than JSON.
- NS-22 show the ledger's per-entry rule snapshot. NS-23 more gateway drivers when they exist.
- NS-24 owner endpoint and view for a payout's lines.
- NS-20 `is_active` on languages must hide a language where it is offered (same as F-04 and decision E).
- Admin job-board write UI (proxy allow-list), see F-11.

## WP-9 Q1 and Q2 implementation (decisions resolved, code not written)
- Q1: block self-reactivation of a barber an admin deactivated, using `activation_logs.activated_by_id`; no check exists today.
- Q2: a separate public barber resource (name, bio, rating, rounded location); keep `email`, `phone`, exact coordinates,
  `submission_count`, `email_verified_at` on the old resource until both mobile apps ship, then remove. Contract tests pin `email`
  (`ApiResponseContractTest.php:507,575`). Needs a coordinated mobile release.

## WP-8 Security follow-ups
- 8a done (generated cross-tenant matrix, `a4d30752`). 8b open: audits and route removal after the mobile re-audit.
- Accepted trade-off to revisit at the next mobile release: Business-app builds before `32d66844` no longer clear the unseen application state.
- Re-run `composer audit`, `npm audit` and a Dart dependency check before release.
- New items from this audit: F-01 to F-11 in [01](01-findings-register.md).

## Features implied by the approved decisions (new)
- Suspended brand banner and blocked-action messaging in the dashboard UI (D8) when the backend starts returning 403 for operational writes.
- Admin ability set for payouts split into create, approve and pay (decision D), if not already separate.
- Platform-admin UI to manage global service categories (decision B), if none exists.
- Language availability toggle visible in preference pickers (decision E).

## WP-10 Deferred by decision D-04 (do not start; outside scope until the owner says so)
- NS-26 plan self-service and billing (D6: manual billing at launch).
- NS-27 stays closed (D7). Apple and Facebook sign-in intentionally unsupported (G9).

## WP-11 Release readiness
- Full gates on a clean tree: backend Pest and Pint, `composer audit`; dashboard lint, typecheck, Vitest, build, full Playwright;
  `melos verify`; `check-conventions.sh`; docs index updated (`docs/index.md`, `docs/next-steps/index.md` status column and the
  "Done (no tests)" cells, `backend/docs/feature-index.md`).
