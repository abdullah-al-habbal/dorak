---
nodeid: docs.backlog
parentnode: docs.graph.part-3
childnodes: []
codeanchors:
  - backend/modules/
  - frontend/web/dashboard/src/
  - frontend/mobile/apps/
---

# Backlog: remaining tasks, issues and decisions

Routes: [documentation graph](../index.md) · [feature modules plan](../feature-modules-plan.md) · [backend feature index](../../backend/docs/feature-index.md).

The single place for what is still open: decisions, bugs, missing features, tech debt and test gaps. It replaced `docs/next-steps/`,
`docs/audit-register/` and `docs/decisions-required.md` on 2026-11-15. Status of that work at removal: the 30 launch tasks (NS-01 to NS-30)
are implemented on the backend and dashboard, and the audit slices S1 to S14 and S7 are done and committed locally. The old files remain in Git
history, for example `git show de6cff09:docs/decisions-required.md` and `git show de6cff09:docs/audit-register/index.md`.

**Rules for this file.** Remove an item when it is done and verified; do not keep a log here (the commit and
[`backend/docs/feature-index.md`](../../backend/docs/feature-index.md) are the record). When a decision is resolved, move it to
"Decisions in force" in one or two lines. Never push; commits stay local.

## 1. Open decisions

| ID | Question | Notes |
|---|---|---|
| BD-2 | What is "Batch 2"? | Out of scope until defined. It meant three things: a finished dashboard DRY refactor, a planned "Batch 2 mobile fix" (the barber app signs the barber out on 403 `feature_not_enabled`, so the downgrade rule is not applied to barber-initiated affiliation paths), and the handover's own question. |

Deferred by decision, not to be started: NS-26 plan self-service and billing (D6, manual billing at launch); NS-27 stays closed (D7); Apple and
Facebook sign-in are unsupported (G9).

## 2. Bugs, risks and fixes

| ID | Item | Layer | Size |
|---|---|---|---|
| BG-4 | Public barber resource leaks `email`, `phone`, exact coordinates, `submission_count`, `email_verified_at`. Decided: add a separate public resource (name, bio, rating, rounded location); keep the old fields until both mobile apps ship, then remove. Contract tests pin `email` (`ApiResponseContractTest`). Needs a coordinated mobile release. | backend, mobile | L |

## 3. Missing features

**Mobile**
- FT-1 Barber resubmit screen in `stylist_app` for NS-30 (rejection reason, resubmission cap).
- FT-2 Notification deep links: invites open `/affiliations`, applicants open `/jobs/:id/applicants` (today `/operations` or `/home`).
- FT-3 Re-audit the mobile apps against the `admin_api` routes the dashboard replaced (activation, audit, brand features), then remove those routes.
- FT-4 Accepted trade-off to revisit at the next mobile release: Business-app builds before `32d66844` no longer clear the unseen application state.

**Dashboard**
- FT-13 Website content: onboarding image upload, create and delete of pages and sections, an editor friendlier than JSON (NS-25).
- FT-14 Show the ledger's per-entry rule snapshot (NS-22); more gateway drivers when they exist (NS-23); owner endpoint and view for a payout's lines (NS-24).
- FT-15 Language `is_active` must hide a language wherever languages are offered (the backend rejects it for new input since S11) (NS-20).
- FT-16 Admin job-board write UI (the proxy allow-list already admits the admin since BG-1).
- FT-17 Suspended-brand banner and blocked-action messages when a write returns 403 (decision A, D8).
- FT-18 Admin UI for global service categories, if none exists (decision B).

## 4. Tech debt

- TD-1 Mobile: split files with several top-level classes (`branch_operations.state.dart`, `manual_barber.event.dart`, `stylist_schedule.state.dart`).
- TD-2 Mobile: replace repeated string literals (statuses, locale codes, error codes) with enums or constants and raw spacing with `DorakDimensions`.
- TD-3 Mobile: replace unchecked `results[n] as X` casts in load blocs; `BookingStatus` must fall back on an unknown value, with a test.
- TD-4 Mobile: remove unused ARB keys (`businessJobFieldRequired` and seven `stylist*` keys), EN and AR together.
- TD-5 Mobile files over 300 lines: `app.router.dart` (826), `branch_detail.bloc.dart` (396), `operations.repository.dart` (340), `discovery_feed.widget.dart` (320), `discovery.bloc.dart` (310), `profile.screen.dart` (308).
- TD-6 Refresh stale docs: both mobile apps' `docs/feature-index.md`, and the historical parts of the `agents-part-2.md` and `claude-part-2.md` guides.
- TD-7 Backend: split `dashboard.php` routes further if it grows.

## 5. Test gaps

- TS-1 Backend depth (allowed, 401, 403, 404, 422, side effects) for NS-04 admin users, NS-05 and NS-14 disputes, NS-06 brand lifecycle, NS-07 clients and bans, NS-08 barbers and activation log, NS-30 approval queue, NS-09 oversight filters, NS-10 notifications feed, NS-11 rate client, NS-12 hours exceptions, NS-13 owner workspace, NS-15 floor plan, NS-16 invitations, NS-17 job board, NS-18 per-brand pricing, NS-19 currencies, NS-20 languages, NS-21 catalog, NS-22 commission, NS-23 gateways, NS-24 payout detail, NS-25 website content. Re-check which are already covered before writing (several have dedicated Dashboard test files).
- TS-2 Branch-account ban test; dashboard refresh after a ban; session continuity after suspend, disable or deactivate.
- TS-3 More dashboard component tests. The setup is done (`tests/helpers/dom.helper.ts`, first tests in `tests/components/common/`); add tests with each UI change, starting with the list states and the form dialogs.
- TS-4 Playwright specs missing: floor-plan editor, invitations (`invitations.spec.ts` is written but has never run), per-brand pricing, oversight dialog and hours exceptions, gateways and languages, rate client, review dispute and moderation, mutations of the eight smoke modules (admin invite and deactivate, client ban, barber approve and reject, currency, commission rule, content edits, job postings and applications, owner brand create), owner status page, suspended-brand banner, session expiry.
- TS-5 A real two-process concurrent-refresh test.
- TS-6 Mobile: tests with every WP change in sections 3 and 4.

## 6. Release readiness

- RR-1 Full gates on a clean tree: backend Pest and Pint, `composer audit`; dashboard lint, typecheck, Vitest, build and the **full Playwright run** (never run for S13 to S14b); `melos verify`; `scripts/check-conventions.sh`.
- RR-2 `npm audit` and a Dart dependency check.
- RR-3 Update `docs/index.md`, the graph and `backend/docs/feature-index.md` for anything shipped.

## 7. Decisions in force

Product decisions D1 to D13 and audit decisions A to F and D-01 to D-07 are resolved. The ones that shape code, in one line each:

- **A (lifecycle):** a Suspended brand or branch is read-only for owners and managers (403); Pending and Disabled branches stay writable for setup; the platform admin bypasses; cancelling a booking stays allowed. One guard: `DashboardWriteGuard`.
- **FT-8:** a closure range (`PUT hours-overrides`, `date_from`, `date_to`, optional `weekdays`, 366 days at most) expands into the existing per-date exceptions; there is no yearly recurrence rule.
- **FT-9 (uploads):** the proxy accepts multipart only on a rule flagged `upload: true`, one image under `file` (2 MB, JPEG, PNG or WebP), re-built so nothing else is forwarded. A purpose gets its own backend route (`POST brands/logo` stores on the public disk and returns `url`); FT-12 and FT-13 add theirs the same way. An upload that is never attached to a saved record stays on disk (no cleanup job yet).
- **FT-11:** opening a vacancy's applications no longer marks them seen; the manager uses "Mark new as seen" (bulk) or "Mark as seen" on a row. There is no way back to new.
- **FT-12 (attributes):** an admin can clear an optional catalog column by sending an explicit `null` (a missing key still leaves it alone); `price_range.max` must be at least `min`; prices are typed in major units and sent in minor units.
- **FT-12 (media):** an item holds at most 10 images (JPEG, PNG or WebP, 2 MB, 4096 px); each add or removal is saved at once from the edit dialog, and a new item gets images after its first save. Removing an image deletes its file. No reordering or alt text yet.
- **B:** only the platform admin creates global service categories; existing tenant-made ones are kept.
- **C:** services belong to a brand; the owner and admin write them, a branch manager is read-only.
- **D:** all admins are equal, no mandatory dual approval; keep creation, approval and payment as separate abilities.
- **E:** an inactive language or retired currency is rejected for new input; stored values stay readable.
- **D-01, D-02, D-05 to D-07 (sessions):** every dashboard request sends `X-Dashboard-Session`, bound to the actor and token; the superseded access token is expired in the database on refresh; the BFF single-flights refresh for 5 seconds; the old claim is revoked after the commit.
- **D1:** a service is owned by a brand or a barber, never a branch. **D6:** manual billing at launch. **D7:** NS-27 closed. **D8, D9:** brand and branch lifecycle states. **D11:** a pending owner gets one branch of setup, no stylists, invitations or bookings until approval. **D13:** website content is managed in the dashboard.
- **Platform admin on staffing:** full permissions on affiliations and the job board (2026-11-13). Brand-level affiliations are closed; rejected barbers cannot re-apply to the same posting.
- **Dashboard component tests (BD-1, 2026-11-15):** `jsdom` and Testing Library are allowed for component tests. **`docs/handover-remaining-work.md` (BD-3, 2026-11-15):** retired; its open items live in this backlog.
- **Barber self-reactivation (BG-3, 2026-11-15):** a barber an admin switched off gets 403 `barber_deactivated_by_admin` from `POST /barbers/{barber}/activate` until an admin reactivates them; implemented by `BarberSelfActivationPolicy`. The mobile apps do not call that route.
- **Claim revocation in the cache (BG-6, 2026-11-15):** accepted as defence in depth. Logout and refresh delete or expire the access token in the database, and `DashboardSessionClaim::matches` needs the claim's `tid` to equal that token, so a cache flush cannot revive a session.
- **BFF refresh single-flight (BG-7, 2026-11-15):** accepted as per process. Run the dashboard BFF as one instance or behind sticky routing per browser session; a second instance racing the rotation would be signed out and sign in again. Rotation is not relaxed with a replay grace window, so token reuse stays detectable.
- **Standing rules:** local commits only, never push; pending-brand records are hidden from public reads; backend contract changes are backward compatible for mobile.

Record a new decision here as one line under this heading, with its date, and link the code or doc that implements it. The older full wording is in Git history (see the top of this file).
