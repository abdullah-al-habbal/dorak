# 05 Implementation plan (decisions final; nothing implemented yet)

Each slice is one `monorepo-task-executor` run: audit, implement, all gates (Pest, Pint, and for dashboard changes lint,
typecheck, Vitest, build, Playwright with `TZ=UTC` on `dorak_test`), security review, hygiene cleanup, one local commit.
Never push. The next session is **implementation only** and starts with S1 after the startup checks and **T-01** ([10](10-prerequisites-t01-t04.md)).
Prerequisites T-01 to T-04 gate the slices as listed in the "Depends on" column.

## Slice table
| Slice | Objective | Depends on | Acceptance | Main files |
|---|---|---|---|---|
| S1 (F-05) **DONE 2026-11-15: `tid` binding plus durable revocation (D-05 to D-07), gates passed, see [03](03-f05-session-lifecycle.md) sections 6, 8 and 8.6; the rollback flag was not created** | Mandatory claim for every Dashboard token, bound to the actor (D-01); previous access token kept on refresh (D-02); rollback flag `dashboard.require_session_claim` (default true) | T-01 | every header state in [03](03-f05-session-lifecycle.md) section 5.4 gives the expected code; old token dead after refresh **only if the owner approves token binding (04 section F); otherwise this criterion is replaced by the accepted residual** | `DashboardAuthorizationMiddleware`, `DashboardSessionClaim::matches`, config, `DashboardLoginApiTest`, `DashboardProfileApiTest`, `DashboardAuthApiTest`, new `DashboardSessionClaimEnforcementTest` |
| S2 (F-01 foundation) **DONE 2026-11-15** | `DashboardWriteGuard` service, `ScopedBranchResolver::resolveForWrite`, exemptions list, architecture test | T-02, T-03; answers in [04](04-decisions-and-open-questions.md) C and D (resolved) | unit tests of the guard; architecture test fails when a non-GET dashboard action neither calls the guard nor is on the reviewed exemption list | new `Modules\Dashboard\Services\DashboardWriteGuard`, `ScopedBranchResolver`, `DashboardServiceProvider`, arch test |
| S3 (F-01 setup group) **DONE 2026-11-15** | Apply guard to branch edit and delete, chairs, floor plan, services, stylists, hours (about 15 routes) | S2, T-02, T-03 | Suspended brand or branch blocked; Disabled and Pending allowed (D9); mobile service CRUD unchanged | matching actions and handlers |
| S4 (F-01 bookings) **DONE 2026-11-15** | Booking status, cancel, reschedule, review, walk-in on branch state | S2, T-02, T-03; cancel allowed, walk-in blocked on Suspended and Disabled branches (resolved) | per resolved decisions | booking actions, `CreateWalkInBookingAction` |
| S5 (F-01 staffing and brand level) **DONE 2026-11-15** | Affiliation respond and terminate, job postings and applications, dispute, barber overrides, `POST /brands` | S2, T-02, T-03 | Suspended blocked; Pending behavior unchanged; `resubmit` reviewed | staffing actions, `BrandStaffingGuard` |
| S6 (F-01c sessions) **DONE 2026-11-15** | Shared liveness check for login, refresh and per request (exists, not banned, barber Enabled, branch operational); optional revocation on suspend, disable, deactivate; ban check for branch accounts | S1, S2, T-02, T-03 | refresh refused for banned, deleted accounts and Disabled barbers; branch ban checked | `DashboardRefreshTokenResolver`, `DashboardAuthorizationMiddleware`, lifecycle services or observers |
| S7 (docs) | Update behavior docs and `feature-index.md` after S1 to S6 (decisions A to F already recorded) | S1 to S6 and S8 to S14 (last slice) | docs match behavior | docs only |
| S8 (F-02, decision B) **DONE 2026-11-15** | Platform Admin only for global categories; tenant migration decision | T-03; decision B and answer 5 (resolved) | manager and owner get 403; admin 201; existing categories kept | `StoreServiceCategoryAction`, policy, `ServiceApiTest` |
| S9 (F-07, decision C) **DONE 2026-11-15** | Owner-only brand-wide service writes; manager branch scope | S2, S3, T-03 | per role matrix | service actions and policy |
| S10 (F-03) **DONE 2026-11-15** | Shared active-currency validation rule at 7 points | T-03 | retired currency rejected, existing rows readable | `Modules\Currency\Rules\ActiveCurrencyRule` in 7 request classes; `tests/Feature/Currency/ActiveCurrencyRuleTest.php` |
| S11 (F-04, decision E) | Hide and reject inactive languages in new preference updates | T-03 | list excludes inactive; update rejects; existing users unaffected (kept until they change it); mobile contract checked | `SetLanguageActiveAction`, preference requests, language resources |
| S12 (F-09) **DONE 2026-11-15** | Separate login limiter names for `/login` and `/owner/brand` | none (T-04 re-check only) | each route has its own limit | `dashboard.php`, config, `AGENTS.md` note |
| S13 (F-10) | Barber lookup oracle mitigation | T-03; answer 6 (resolved) | uniform response for known and unknown people, invite resolved on the server | lookup action, tests |
| S14 (F-06) | Policies for the remaining scope-only write actions, de-duplicate booking scope query | S2 to S5, T-03; answer 7 (resolved) | each converted action has a policy test; about 15 actions per slice (S14a, S14b, ...) | `modules/Dashboard/Policies`, actions |

## S1 design (F-05)
- Middleware (D-01): for every token with ability `dashboard`, require a present, valid header, then require claim `sub` and `actor_type` to match the
  authenticated model. Add `DashboardSessionClaim::matches(string $claim, string $actorId, DashboardActorTypeEnum $type)`.
- No DB change. D-02: refresh keeps the previous access token; deleting it (a nullable token-id column on the refresh row) is out of scope unless the owner decides later.
- Compatibility: BFF already complies; update the three test files; in-flight sessions are safe because the BFF refuses to forward without the claim cookie.
- Rollback: set the flag off or revert; no data to undo. The flag is a rollback tool only: D-01 is the required behavior and the default is on.
- Tests: the nine items of [03](03-f05-session-lifecycle.md) section 5.9 (header absent, empty, malformed, expired, revoked, mismatched each 401; old token after refresh 401 needs token binding; mobile unchanged; flag off still passes).
- T-01 findings: the flag `dashboard.require_session_claim` does not exist yet and must be created; recommended addition (pending owner approval): claim carries `tid` and the middleware requires it to equal the current token id ([03](03-f05-session-lifecycle.md) section 5.7).

## S2 to S6 design (F-01)
- Central service, not one route middleware: an owner can hold several brands, and the target resource (often from the body)
  decides which state applies.
- `DashboardWriteGuard::ensureBranchWritable(actor, branchId)` and `ensureBrandWritable(actor, brandId)`: for non-admin actors throw
  when the brand or branch is Suspended (reuse `BrandApprovalGuard::ensureNotSuspended` and its exception; confirm the HTTP mapping first).
- Exemptions as a constant list of routes or abilities (self-account, logout, cancel of an existing booking, per decisions).
- `DashboardActorLiveness` for refresh and login: exists, not banned (including branch), barber Enabled, branch operational as decided.
- No DB schema change expected. Rollback flag: `dashboard.enforce_lifecycle_writes`.
- Tests: generated matrix of operational write routes (from the router) crossed with {brand Suspended, branch Suspended, branch Disabled,
  barber Disabled, banned}; architecture test over non-GET dashboard actions; refresh re-validation; mobile no-change tests.

## Risks
Breaking mobile service CRUD (shared actions), overlapping staffing rules, logging out legitimate users after session revocation,
missed header-less test callers, scope creep into every action in S2.

## Execution order for the next session (implementation only; decisions final 2026-11-14)
Each item is its own `monorepo-task-executor` run and local commit; stop and report on any failed gate or on a conflict with a decision.
Startup first (see [00](00-next-session-start.md)), then the prerequisites, then:

| Order | Slice | Why here (verified dependency) |
|---|---|---|
| 1 | **S1** F-05 mandatory claim (D-01, D-02) | needs T-01 only; also the middleware that S6 later extends |
| 2 | **S10** active-currency rule | independent; T-03 for shared requests |
| 3 | **S12** separate login limiter names | independent |
| 4 | **S2** write-guard foundation | T-02, T-03; every F-01 slice needs it |
| 5 | **S3** setup group | S2 |
| 6 | **S4** bookings | S2 |
| 7 | **S5** staffing and brand level | S2 |
| 8 | **S6** sessions and liveness | S1 (same middleware) and S2 |
| 9 | **S8** category admin-only | T-03 |
| 10 | **S9** brand-wide services | S2 and S3 (same service actions) |
| 11 | **S11** inactive languages | T-03 |
| 12 | **S13** uniform barber lookup | T-03 |
| 13 | **S14a, S14b, ...** policy conversion, about 15 actions per slice | after S3 to S5 (same actions) |
| 14 | **S7** docs and `feature-index.md` sync | after every code slice |

The handover work packages (WP-1 depth gaps, WP-9, WP-3 gaps, WP-6, WP-4 and WP-5, WP-8b, WP-2 component tests with jsdom, WP-11) follow only after the
slices above and are planned in [07](07-missing-features.md). **Out of scope:** Batch 2 (D-03) and WP-10 / billing / NS-26 / NS-27 (D-04).

## S1 extension (F-05e to F-05i, decided and implemented 2026-11-15, gates passed, committed locally with S1)
Decisions D-05 to D-07 ([04](04-decisions-and-open-questions.md) section G); implementation and evidence in [03](03-f05-session-lifecycle.md) section 8. Gates run 2026-11-15: full Pest 2470 passed, Vitest 609 passed, Playwright 441 passed ([03](03-f05-session-lifecycle.md) section 8.6). S10 done (see below). S12 done (see below). S2 done (see below). Next slice: S11.

## S14a (F-06) done 2026-11-15
First policy conversion batch, 11 actions, no behavior change for allowed callers. `dashboard.booking.manage` (`DashboardBookingPolicy::manage`) now guards cancel, reschedule and status update; `dashboard.stylist.manage` and `dashboard.stylist.create` (`DashboardStylistPolicy`, scope = the stylist's chairs, same as `ShowStylistQuery`) guard store, update, destroy, activate and deactivate; the existing `dashboard.branch.updateHours` now also guards the hours exceptions (set, clear) and the floor plan. Out-of-scope ids still answer 404 first (scoped lookup), so the policy is the second line. Tests: `DashboardPoliciesTest` (booking, stylist, hours ability). Remaining for S14b: branch lifecycle (suspend, reactivate, switch), brands, job postings, affiliations, applications, profile and notification writes.

## S13 (F-10) done 2026-11-15
`GET /barber-lookup` matches names only. New dashboard-only `POST /branches/{branch}/affiliations/by-contact` (`InviteBranchAffiliationByContactAction`, same scope, staffing-write guard and brand-approval checks as the id invite, shares the lookup throttle) finds a discoverable barber by exact email or phone and invites them; unknown, non-discoverable and already-affiliated contacts do nothing, and every case returns 202 with the same body. The invite dialog sends a contact-shaped term (`BARBER_CONTACT_PATTERN`) through it; proxy allow-list extended. Known limit: response timing is not equalised. T-03: mobile routes and `InviteAffiliationRequest` untouched. Tests: lookup no longer matches email or phone, by-contact uniformity, validation, scope, roles, cross-tenant route matrix, Vitest (allow-list, pattern), Playwright `invitations.spec.ts`.

## S11 (F-04) done 2026-11-15
One `ActiveLanguageRule` (`modules/Language/Rules`, EN and AR message `language_not_available`) added to `preferred_language` in the shared `UpdateSettingsRequest` (client, barber, branch and dashboard settings, so mobile and dashboard get the same 422). A language row switched off is rejected for new input; a code with no row stays governed by the `Locale` enum; stored preferences, reads and unrelated settings updates are unchanged (users on an inactive language keep it until they change it). No public language list exists (only the admin list, which must show inactive rows), so there is nothing to hide server-side. Tests: `InactiveLanguagePreferenceTest`. Gates: full Pest 2605 passed, pint clean, conventions OK. No dashboard or mobile code changed.

## S12 (F-09) done 2026-11-15
Named limiters `dashboard-login` and `dashboard-owner-brand` (`DashboardLoginConstants`, registered in `DashboardServiceProvider`), each counted per IP under its own cache key. `/login` uses `dashboard.dashboard.login_attempts_per_minute`; `/owner/brand` uses the new `owner_brand_attempts_per_minute` (`DASHBOARD_OWNER_BRAND_ATTEMPTS_PER_MINUTE`, falls back to the login value, so the E2E `.env` override of `DASHBOARD_LOGIN_ATTEMPTS_PER_MINUTE` keeps covering both). Tests in `DashboardLoginApiTest`. Gates: see commit.

## S10 (F-03) done 2026-11-15
One `ActiveCurrencyRule` (`modules/Currency/Rules`, EN and AR message `currency_not_available`) replaces the bare `exists:currencies,code` in `BarberServiceRequest` (mobile), `ServiceRequest` (dashboard), `SavePlanRequest`, `BrandPayloadRules` (create), `UpdateBrandRequest`, `SaveCommissionRuleRequest` and `UpdateSettingsRequest` (dashboard and the three mobile apps). T-03 consumers: dashboard BFF and mobile apps send the same field names and get the same 422 shape; `GET /currencies` already lists active currencies only, so pickers never offer a retired one. Decision: retired is rejected on every write that carries the field, including an edit that resends the stored retired code (the user re-picks); stored rows, reads and the settings GET stay unchanged (tested). Gates: full Pest 2479 passed, pint clean. No dashboard or mobile code changed, so their gates were not rerun.

## S2 (F-01 foundation) done 2026-11-15
- `Modules\Dashboard\Services\DashboardWriteGuard`: `ensureBrandWritable` (delegates to `BrandApprovalGuard::ensureNotSuspended`, 403 `brand_suspended`) and `ensureBranchWritable` (brand check, then a Suspended branch gives the new 403 `branch_read_only`, `Modules\Branch\Exceptions\BranchReadOnlyException`, EN and AR). Platform admin bypasses; Pending and Disabled branches and Pending brands stay writable (D9); cancel and self-account writes simply never call it.
- `ScopedBranchResolver::resolveForWrite(Request, branchId)`: scope check first (out of scope stays 404 and never reveals state), then the guard.
- `Modules\Dashboard\Support\DashboardWriteExemptions`: `SELF_ACCOUNT` (9 actions) and `PENDING` (39 actions, each tagged with the converting slice: S3 19, S4 5, S5 14, S8 1). Admin-only and unauthenticated routes are recognised from their middleware.
- `DashboardWriteGuardArchitectureTest`: fails when a non-GET tenant dashboard action neither calls the guard (`DashboardWriteGuard` or `resolveForWrite(` in its source) nor is listed, and when a listed entry is unrouted, listed twice, or already guarded. **Each of S3 to S5 and S8 removes its actions from `PENDING` in the same commit that adds the guard call.**
- No route behavior changed in S2, so T-02 per-defect runtime tests (failing first) belong to S3 to S5 where each defect is fixed; the guard's state matrix is tested in `DashboardWriteGuardTest`. T-03: no shared Dashboard/Mobile action was edited; `ScopedBranchResolver` is dashboard-only, and mobile routes keep their `EnsureBranchAccountAccess` and `EnsureBarberAccountAccess` middleware. S3 must add a mobile regression test where it guards a shared service action.

## S3 (F-01 setup group) done 2026-11-15
- 19 actions now call `DashboardWriteGuard` (branch store, update, delete, switch on/off, opening hours, hours override set and clear, floor plan; chair store, update, delete; service store, update, delete; stylist store, update, delete, activate, deactivate) and left `DashboardWriteExemptions::PENDING`.
- New guard helpers: `ensureBranchIdWritable` (null or unknown id passes, so the action keeps its own 403 or 404), `ensureChairWritable`, `ensureServiceableWritable` (brand service follows the brand, barber service follows the managing branch, an independent barber has none). `resolveForWrite` replaces `resolve` in the hours override actions.
- Order inside each action: scope and role policy first (404 or 403 stay unchanged), then the guard, then the write. A chair or stylist moved to another branch checks both the source and the target.
- Service actions are shared with the mobile branch routes (`mobile.php`); the guard only adds a refusal for a Suspended brand or branch, so Active, Pending and Disabled flows and the existing mobile CRUD tests are unchanged (full Pest green).
- Tests: `DashboardSetupWriteGuardTest` (15 routes x owner and manager on a Suspended brand, 14 routes on a Suspended branch, create branch and stylist, Disabled writable, admin bypass, reads unaffected) and the helper tests in `DashboardWriteGuardTest`. Gates: full Pest 2549 passed, pint clean.

## S4 (F-01 bookings) done 2026-11-15
- `UpdateBookingStatusAction` (guard unless the target status is Cancelled), `RescheduleBookingAction`, `ReviewBookingClientAction` (guard when the booking is in scope; otherwise the handler's own error stays) and `CreateWalkInBookingAction` now call `DashboardWriteGuard`. `CancelBookingAction` moved to the new permanent list `DashboardWriteExemptions::ALLOWED_WHEN_SUSPENDED` (decision A, point 2); the architecture test reads it as reviewed.
- New guard methods: `ensureBookingWritable` (booking `branch_id`, else its chair's branch) and `ensureBranchTakesWalkIns` (Suspended brand 403 `brand_suspended`, Suspended branch 403 `branch_read_only`, Disabled branch new 403 `branch_not_operational`, `BranchNotOperationalException`, EN and AR).
- Tests: `DashboardBookingWriteGuardTest` (status, reschedule, walk-in refused and cancel allowed for both suspension kinds; cancel through the status endpoint; review; Disabled branch walk-in; admin bypass; cross-tenant 404). Gates: see commit.

## S5 (F-01 staffing and brand level) done 2026-11-15
- New `ScopedBranchResolver::resolveForStaffingWrite` (role, then scope 404, then guard); the 8 staffing write actions (invite, respond, terminate, job posting store, update, delete, applications mark-seen and status) use it. Reads (`ListBranchApplicationsAction`) keep `resolveForStaffing`. `FlagBranchReviewDisputeAction` uses `resolveForWrite`; barber override upsert and destroy call `ensureBrandWritable`; `UpdateBrandAction` now goes through the guard (same 403 `brand_suspended` as before).
- `POST /brands` (`StoreBrandAction`) and `resubmit` (`ResubmitBrandAction`) moved to `ALLOWED_WHEN_SUSPENDED` with reasons: the owner keeps `POST /brands` (decision A, point 3) and `BrandReviewService::resubmit` only accepts a Rejected brand (409 otherwise), so a Suspended brand can never be resubmitted. Pending behavior is unchanged (`BrandApprovalGuard` rules stay after the guard).
- The architecture test now also accepts `resolveForStaffingWrite(`. `PENDING` holds only S8's `StoreServiceCategoryAction`.
- Tests: `DashboardStaffingWriteGuardTest` (9 staffing routes x Suspended brand and Suspended branch, 404 kept for missing records, admin bypass, override and brand update refused, `POST /brands` allowed, resubmit 409).

## S6 (F-01b, F-01c sessions) done 2026-11-15
- New `Modules\Dashboard\Services\DashboardActorLiveness`: admin active; manager exists and is not banned; barber exists, Enabled and not banned; owner exists and is not banned (status, verified email and brand stay in `DashboardOwnerActorResolver`). Branch status does **not** end a manager session: a Suspended or Disabled branch stays readable and the write guard blocks its writes (decision A, D8, D9).
- Refresh (`DashboardRefreshTokenResolver::actorFromRecord`) asks it for every actor type, so banned, deleted, deactivated or Disabled accounts get 401 and the refresh token is revoked (the admin-only check is folded in). Login: a banned manager is refused with `AccountBannedException` like barbers and owners. Per request (`DashboardAuthorizationMiddleware`): a banned manager gets 403 `ACCOUNT_BANNED` (same body as `EnsureNotBanned`), a barber that is not Enabled gets 401. `BranchModel::isBanned()` added; `BanObserver` now also deletes a banned manager's access tokens.
- Not done (optional in the plan, no decision asks for it): revoking sessions on suspend, switch-off or deactivate. Reads stay open by design, so those sessions remain valid.
- Tests: `DashboardSessionLivenessTest` (refresh refused for banned or Disabled barber, banned owner, banned or deleted manager; renewed for a live manager of a Suspended branch and a live barber; manager login ban; request-time manager ban 403; expired ban passes; Disabled barber 401).

## S8 (F-02, decision B) done 2026-11-15
- `POST /service-categories` authorizes `dashboard.serviceCategory.create` (`DashboardServiceCategoryPolicy::create`, platform admin only): owner and manager get 403, admin 201, barbers keep their earlier 403, existing categories stay and the list stays readable for owners and managers. No tenant request flow (answer 5). `StoreServiceCategoryAction` moved from `PENDING` to the new reviewed list `DashboardWriteExemptions::PLATFORM_ADMIN_ONLY`; `PENDING` is now empty.
- Tests: `ServiceApiTest` (manager 403, owner 403 with the list still readable, admin 201, duplicate name checked as admin).
- Follow-up closed in S9: the inline new-category form was removed from `ServiceCategoryField` (no role that can open the dialog may create a category), and the proxy allows `POST service-categories` for the admin only.

## S9 (F-07, decision C) done 2026-11-15
- **Owner decision (2026-11-15, asked in-session):** services belong to a Brand and never to a Branch (D1), so a manager has no branch-owned service to manage. Managers are **read-only** for services; only the brand owner (own brands) and the platform admin write them. Replaces the D1 Task 54 rule that let a manager write their brand's services.
- Backend: `DashboardActor::canManageBrandServices` now equals `canManageBrand`; `DestroyServiceAction` gained the missing `dashboard.service.write` gate (it had none, so a manager could delete). The same actions serve `/branch/services` for the business mobile app, so mobile managers get 403 on writes too.
- Dashboard: Services screen is read-only unless the actor is the owner (`readOnly = actor !== Owner`, admin keeps the brand filter); the proxy allows `POST/PUT/DELETE services` for owner and admin only and `POST service-categories` for the admin only; inline new-category form removed.
- Mobile (`business_app`): services list is read-only (no add button, no edit or delete); `BusinessServicesBloc` lost `save`, `delete` and the brand lookup; the form screen, draft entity and two routes were removed; `businessServicesEmpty` copy updated (EN, AR). The shared `BranchServiceRepository` write methods stay in `core` (unused by the app).
- Tests: `ServiceApiTest` (manager create, update, delete 403 and read still 200; owner full CRUD on own brand; owner 403 and 404 on a foreign brand), `DashboardPoliciesTest`, `MobileScopedRoutesTest`, Vitest proxy allow-list, Playwright `services.spec.ts` (manager read-only, owner flows), Flutter business app tests.
- Gates: Pest 2603 passed (full run before the mobile test fix, then `tests/Feature/Mobile` 11 passed), pint clean, Vitest 612 passed, lint and tsc clean, `melos verify` passed.

## Centralized API responses (cross-cutting task, 2026-11-15, done between S8 and S9)
All 16 hand-built `response()->json(` calls in exceptions, middleware and `AccountBannedResponse` now go through `ApiResponseTrait`; new bases `ApiErrorException`, `ConflictApiException`, `ForbiddenApiException`; `ErrorCodeEnum` gained `ACCOUNT_NOT_ACTIVE`, `ACCOUNT_BANNED`, `TOKEN_ABILITY_MISSING`. `ApiResponseArchitectureTest` bans the direct call. Doc: `backend/docs/api-response-standard.md`. Wire change: only the `timestamp` format of those responses (`+00:00` to `.123Z`); codes and statuses are identical, and the web and Flutter clients do not depend on the format. Slice order is unchanged; the next slice is S9 (done afterwards, see below).
