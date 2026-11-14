# 08 Technical debt and convention gaps

## Backend (WP-7; marked done with three open items)
- 71 of 112 Dashboard actions have no direct policy call (bookings status, cancel and reschedule, hours overrides, affiliations,
  job postings and applications, stylists, floor plan, brand update, branch suspend and reactivate, others). They rely on scope-filtered
  lookups that return 404. `backend/CLAUDE.md` says a scoped query alone is not authorization. Owner answered 2026-11-14: convert, about 15 per slice (S14). Same as F-06.
- Five methods of 41 to 43 lines against "roughly 40": `CreateBookingEloquentResolver::resolve`, `ReviewClientHandler::handle`,
  `ExploreRanker::score`, `RecomputeClientVectorsCommand::processEntity` and `::processClient`. No file over 300 lines.
- `dashboard.php` was split by middleware group (59 lines now); the backend guide allows further splits.
- Remove `admin_api` routes the dashboard replaced once the mobile re-audit confirms no client uses them. Keep `backend/docs/feature-index.md` current.
- Duplicated booking scope query in Update, Cancel and Reschedule (F-06).
- Migration guard falls back to `--all` because `origin/dev` does not exist (informational).

## Mobile (WP-5, not started; from `docs/mobile-audit-g10-g11/index.md`)
- Split files with several top-level classes: `branch_operations.state.dart`, `manual_barber.event.dart`, `stylist_schedule.state.dart`.
- Replace repeated string literals (statuses, locale codes, error codes) with enums or constants, and raw spacing with `DorakDimensions`.
- Replace unchecked `results[n] as X` casts in load blocs. `BookingStatus` must not throw on an unknown value (fallback plus a test).
- Remove unused ARB keys: `businessJobFieldRequired` and seven `stylist*` keys (EN and AR parity).
- Files over 300 lines (hand-written): `client_app/.../app.router.dart` (826), `branch_detail.bloc.dart` (396), `operations.repository.dart` (340),
  `discovery_feed.widget.dart` (320), `discovery.bloc.dart` (310), `profile.screen.dart` (308).
- Refresh stale docs: both apps' `docs/feature-index.md`, and the historical parts of `agents-part-2.md` and `claude-part-2.md`.

## Configuration and operations
- F-09 shared login limiter; E2E depends on a raised limit in `.env` (a deny rule blocks reading `.env` files).
- Revocation store for claims lives in cache (F-05e).
- The `backend/CLAUDE.md` text mentions 22 policy classes; the repo has 27 (verify the correction in `fef8e27a`).

## Documentation inconsistencies
- F-11 proxy comment versus `decisions-required.md:69`.
- Handover mentions a currency in-use guard that does not exist.
- `docs/handover-remaining-work.md` is untracked (the owner's file; reconciled by me on 2026-11-14, section 0a); owner has not asked for it to be committed.
