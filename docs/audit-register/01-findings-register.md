# 01 Findings register (F-01 to F-11)

Source: independent architecture audit, 2026-11-14, repository at `ff7755c3`. Method: static trace of code, `route:list`,
and existing tests read as specifications. **Nothing here was reproduced at runtime** (no Pest, no Playwright, no DB writes),
so every grade means "trace-confirmed, not executed" unless a passing existing test is named.

Grades: **confirmed** (full path traced), **partially confirmed**, **unverified**.
Classes: real defect, missing test coverage, intentional behavior backed by a decision, needs a product decision.

Scope facts: dashboard API = 186 routes / 184 action classes (112 in `Modules\Dashboard`, 72 in other modules).
110 authenticated write routes: 60 admin-only, 50 reachable by tenant roles. Cross-tenant isolation looked sound
(child IDs bound to the parent, for example `where('branch_id', ...)->findOrFail`; generated matrix in `a4d30752`).
`docs/decisions-required.md` shows 0 open decisions. WP-1 verdict: route-level complete (all 186 routes are called by at
least one Pest file), with depth gaps. The handover's "currency in-use guard" does not exist in code.

| ID | Title | Class | Severity | Status | Detail file |
|---|---|---|---|---|---|
| F-01 | Account state not enforced on operational writes (suspended brand or branch, manager accounts, refresh) | Real defect vs decision A, plus missing tests | Medium | Confirmed by trace | [02](02-f01-account-state-matrix.md) |
| F-02 | Any manager or owner can create a global active `ServiceCatalogCategory` | Real defect vs decision B | Medium | Confirmed by trace | below |
| F-03 | A retired currency is still accepted by seven validation points | Real defect | Low to Medium | Confirmed by trace | below |
| F-04 | Language `is_active` has no consumer | Real defect vs decision E | Low | Confirmed by trace | below |
| F-05 | Dashboard session claim is advisory (header optional, claim not bound to the actor, previous access token survives refresh) | Documented behavior plus defense-in-depth gap | Low to Medium | Confirmed by trace; T-01 must verify before S1. Decided: D-01 (mandatory and bound), D-02 (previous token kept) | [03](03-f05-session-lifecycle.md), [10](10-prerequisites-t01-t04.md) |
| F-06 | Inconsistent and duplicated authorization (scope-only writes, few gates) | Tech debt, product decision open | Medium | Confirmed | below |
| F-07 | A D1 manager can edit and delete brand-wide services | Real defect vs decision C | Medium | Confirmed by trace | below |
| F-08 | All admins have equal privileges including payouts | Decision D (no dual approval) | Info | Resolved by decision | below |
| F-09 | Login limiter config shared with `/owner/brand`; E2E needs a raised limit in `.env` | Operational risk | Low | Confirmed | below |
| F-10 | `/barber-lookup` is an exact email or phone existence oracle | Real defect (privacy), throttled | Low to Medium | Confirmed by trace | below |
| F-11 | Proxy allow-list comment "admin has no stake" contradicts `decisions-required.md:69` | Documentation inconsistency | Low | Confirmed | below |

## Resolution status and prerequisites
- F-05: decisions D-01 and D-02 are final ([04](04-decisions-and-open-questions.md) E); implement in S1 after T-01.
- F-01 and every slice that shares code with mobile: T-02 and T-03 first ([10](10-prerequisites-t01-t04.md)).

## F-02 Global service category creation by tenant roles
- Where: `StoreServiceCategoryAction`; test `ServiceApiTest.php:88-100` pins the current behavior.
- Actual: a manager or owner creates a global, active category visible to every tenant.
- Required (decision B): Platform Admin only. Existing tenant-created categories need a data decision (keep, deactivate or migrate) before enforcing.
- Resolved 2026-11-14: existing tenant-created categories are kept, only the platform admin creates new ones, no tenant request flow (slice S8).

## F-03 Retired currency still accepted
- Only `StoreExchangeRateRequest.php:20` enforces `is_active`.
- Bare `exists:currencies,code` in: `BarberServiceRequest:17`, `ServiceRequest:18`, `SavePlanRequest:25`,
  `BrandPayloadRules:19`, `UpdateBrandRequest:35`, `SaveCommissionRuleRequest:41`, `UpdateSettingsRequest:20`.
- Fix shape: one shared rule (for example `ActiveCurrencyRule`) used by all seven; existing rows that reference a retired
  currency stay readable. Not covered by any test today (also the missing "in-use guard" from the handover).

## F-04 Language `is_active` has no consumer
- `SetLanguageActiveAction.php:23-27` stores the flag; nothing filters offered languages or rejects an inactive one in
  preference updates. Required (decision E): hide from new selections and reject in new preference updates; existing
  users on an inactive language keep it until they change it. Mobile contract impact: check `Preference` and locale lists.

## F-06 Authorization consistency
- 28 write actions are scope-only (no policy or gate); gates exist for only 7 abilities; `DestroyServiceAction` is ungated;
  the booking scope query is copied into Update, Cancel and Reschedule actions.
- Handover WP-7 open item: 71 of 112 Dashboard actions have no direct policy call; `backend/CLAUDE.md` says a scoped query
  alone is not authorization. Owner answered 2026-11-14: convert, about 15 actions per slice (S14; see [04](04-decisions-and-open-questions.md)).
- 27 `*Policy.php` files exist.

## F-07 Brand-wide services editable by a branch manager
- A D1 manager can update or delete services that belong to the whole brand. Required (decision C): Owner manages
  brand-wide services; a Manager is limited to authorized branch scope. Needs a policy plus a test per role.

## F-08 Admin privileges
- All admins are equal, including payouts. Decision D: no mandatory dual approval; keep creation, approval and payment as
  separate permissions. Implementation gap: confirm those three abilities exist separately in the payout module.

## F-09 Login limiter
- `dashboard.php:33,42`: `/login` and `/owner/brand` share `dashboard.dashboard.login_attempts_per_minute` (default 5;
  `.env.example:89`). E2E needs `.env` `DASHBOARD_LOGIN_ATTEMPTS_PER_MINUTE` above 5 (`frontend/web/dashboard/AGENTS.md:113`).
- Risk: production default 5 per minute per key is shared by two unrelated routes; E2E depends on a local `.env` value.
- Fix idea: separate limiter names; keep the E2E override documented.

## F-10 Barber lookup oracle
- `GET /barber-lookup` returns id and name for an exact email or phone. Throttled, but still an enumeration oracle.
- Resolved 2026-11-14: uniform response for known and unknown people, the invite is resolved on the server (slice S13).

## F-11 Proxy allow-list comment
- `frontend/web/dashboard/src/services/api/proxy/*` comment says "admin has no stake" while `decisions-required.md:69`
  records the admin job-board write permission. Documentation only; the allow-list itself blocks admin job-board writes
  (feature "WP-3 gap 9" and WP-6 in [07](07-missing-features.md)).
