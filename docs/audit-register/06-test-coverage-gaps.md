# 06 Test coverage gaps

Baseline at `ff7755c3` (2026-11-14): Pest 2425 passed (10319 assertions), concurrency 15, Vitest 121 files and 596 tests,
Playwright 435 passed (32 specs; desktop, mobile-390, ultrawide-3440), mobile test files 141. Backend test files 257.

## Backend (WP-1 depth gaps; route-level coverage is complete, all 186 routes are called by at least one Pest file)
- No test asserts dashboard writes (chairs, services, booking transitions, hours, stylists) by a suspended brand or branch (F-01a).
- No test of session continuity after suspend, disable or deactivate; only a deactivated admin refresh (`DashboardAuthApiTest.php:207`).
- No test for dashboard refresh after a ban (`BanEnforcementTest` covers mobile `/client/refresh-token` only) (F-01c).
- No test for a request without `X-Dashboard-Session` after refresh, empty header, mismatched claim, revoked claim with live token (F-05d). All of these were run once by the T-01 probe (results in [03](03-f05-session-lifecycle.md) section 5.4) but **no permanent test existed**; the set of section 5.9 is now written (`DashboardSessionClaimEnforcementTest`, Vitest refresh route test) and **not yet executed against MySQL** ([03](03-f05-session-lifecycle.md) section 6.5).
- No test that retired currencies are rejected at the seven validation points (F-03); no currency in-use guard exists.
- No test that an inactive language is hidden or rejected (F-04).
- No test that a manager or owner cannot create a global category (F-02 pins the opposite: `ServiceApiTest.php:88-100`).
- No branch-account ban test (F-01b).
- Handover WP-1 list needing depth (allowed, 401, 403, 404, 422, side effects): NS-04 admin invite, edit, deactivate (last-active and self guards);
  NS-05 and NS-14 review disputes; NS-06 brand lifecycle (reject, resubmit, suspend, locks, feature overrides, history, emails);
  NS-07 clients and bans; NS-08 barbers and activation log; NS-30 approval queue; NS-09 branch oversight filters; NS-10 notifications feed;
  NS-11 rate client; NS-12 closure days and special hours; NS-13 owner workspace; NS-15 floor plan save; NS-16 invitations;
  NS-17 job postings and applications; NS-18 per-brand pricing; NS-19 currencies and exchange rates; NS-20 languages;
  NS-21 catalog items and tags; NS-22 commission rules and ledger; NS-23 gateways; NS-24 payout detail; NS-25 website content,
  testimonials, onboarding; public-read, cross-tenant and token-scope cases. Re-audit which are still open (WP-1 is in progress).
- Proposed new generated test: operational write routes x account states (see [05](05-implementation-plan.md)); architecture test for guard coverage.

## Dashboard Vitest (WP-2)
- Pure logic done in `62b9abaf`. Component tests need jsdom and Testing Library, which needs owner approval (open decision).

## Dashboard Playwright (WP-3 gaps; smoke specs for eight modules exist from `ff7755c3`)
1. Floor-plan editor (layout, zones, save); `chairs.spec.ts` covers list and CRUD only.
2. Invitations (invite, accept, reject, terminate) on the stylists screen.
3. Per-brand stylist pricing.
4. Admin branch-oversight dialog, closure days and special hours (NS-12).
5. Payment gateways and languages in admin settings (NS-20, NS-23).
6. Notifications bell and feed (NS-10); only the preference switch is covered.
7. Rate client (NS-11), review dispute and moderation (NS-05, NS-14); `reviews.spec.ts` is read-only.
8. Mutations of the eight smoke modules: admin invite and deactivate, client ban and unban, barber approve, reject, activate and ban,
   currency create, retire and rates, commission rule CRUD, content edits, job postings and applications, owner brand create.
9. Admin job-board write UI does not exist (proxy allow-list), nothing to test yet.
10. Owner `status` page only reached through registration and branch specs.
- New Playwright needs after F-01 and F-05: suspended-brand banner and blocked actions in the UI (copy for the 403 reason), session-expiry behavior with the mandatory claim.

## Mobile
- 141 test files; each WP-4 and WP-5 change needs tests ([07](07-missing-features.md), [08](08-tech-debt.md)).
- Not run in the last verification: `composer audit`, `npm audit`, Dart dependency check, `melos verify`.
- F-05 final review (2026-11-15): the tests are written (Pest cases in `DashboardSessionClaimEnforcementTest`, Vitest `refresh.single-flight.test.ts` and the parallel case in `refresh.route.test.ts`); Vitest, Pest (full suite, 2470 passed) and the Playwright spec `session-refresh.spec.ts` ran on 2026-11-15. Still missing: a real two-process concurrent `rotate()` test in the `concurrency` group. See [03](03-f05-session-lifecycle.md) section 8.4.
