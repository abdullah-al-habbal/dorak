# 10 Mandatory prerequisites T-01 to T-04

Set 2026-11-14 (decision G-01 session). They are **mandatory for the next implementation session**: each must be completed, with its result
written down, before the implementation work it gates. They are documentation and verification steps, not features. Application code stays
unchanged until the gated slice starts.

| ID | Prerequisite | Gates | Status |
|---|---|---|---|
| T-01 | Verify F-05 against the running code and resolve the conflicting audit descriptions | S1 | **Audit and verification done 2026-11-14** ([03](03-f05-session-lifecycle.md) section 5). Owner approved `tid` binding; implemented, see [03](03-f05-session-lifecycle.md) section 6 (all gates passed 2026-11-15). Final review fixes D-05 to D-07: [03](03-f05-session-lifecycle.md) section 8 |
| T-02 | Verify F-01 runtime behavior per affected fix and add regression tests for confirmed defects | S2 to S6 | Required, not started |
| T-03 | Trace shared Dashboard/Mobile paths and add regression coverage for both consumers | S2 to S6, S8, S9, S10, S11, S13, S14 | Required, not started |
| T-04 | Reconcile decisions, findings, scope, dependency order and next-session instructions | every slice (re-check at each start) | Documentation part done 2026-11-14; re-check at session start |

## T-01 F-05 verification (before S1)
Trace and verify, then record the result in [03](03-f05-session-lifecycle.md):
1. Where `DashboardAuthorizationMiddleware` is registered and which routes it covers (all dashboard authenticated groups, `/me`, `/logout`,
   `/refresh`, the mobile-scoped dashboard routes, and any route outside it). Middleware order against the role and ability middleware.
2. The actual HTTP status and error code for each header state: missing, empty, malformed, bad signature, unknown `kid`, expired, revoked,
   claim of another actor, claim with a different `actor_type`; with and without a live bearer token; after refresh; after logout.
3. Resolve these known conflicts in the audit text (found 2026-11-14 while preparing this handover):
   - The title of F-05 in [01](01-findings-register.md) said "not revoked on refresh". The code revokes the **previous claim** on refresh and keeps the
     **previous access token** (`RefreshSessionAction`); the wording is corrected, but the behavior must be confirmed by a test.
   - File [03](03-f05-session-lifecycle.md) cited `DashboardAuthApiTest.php:170` as proof that a token without the header passes. That test only shows
     the role middleware answering 403 for a barber. Better evidence is `:55-59`, `:118-125` and `:140-146` (bearer only, `/me` returns 200). Confirm by run.
   - `DashboardAuthApiTest.php:198-200` sends the old claim **without a bearer token**, so it proves "no bearer gives 401", not "a revoked claim is
     rejected". A bearer-plus-revoked-claim test does not exist yet.
   - Earlier text called the claim header "advisory" and a "defect"; the documented contract (`docs/planning/existing-frontend-audit-part-2.md:20`)
     says "when sent, must validate". Decision D-01 supersedes it; update that planning line when S1 lands.
4. Where the `dashboard.require_session_claim` rollback flag is read, and confirm it defaults to true (D-01 is the required behavior; turning it off is a
   rollback tool only and needs the owner's approval to ship disabled).
**Result (2026-11-14):** items 1 to 4 are answered in [03](03-f05-session-lifecycle.md) sections 5.3 to 5.8. Item 1: middleware is first in every dashboard group, `mobile.php` is outside it. Item 2: measured by a probe run on `dorak_test` (section 5.4). Item 3: the four conflicts are confirmed as imprecise (`:170` proves only a role 403; `:198-200` sends no bearer; "advisory" superseded by D-01; "not revoked on refresh" is wrong for the claim and right for the access token). Item 4: the flag **does not exist in code** yet.
5. Output: a table "header state, token state, expected status, actual status", the list of routes covered, and the tests to add. S1 starts only after this.

## T-02 F-01 runtime verification (before S2 to S6)
Before each affected fix, run (in a Pest test or a tinker session on `dorak_test` only) the scenario and record: the **actor** (owner, manager,
barber, admin), the **resource** (route and model), the **lifecycle state** (brand, branch, barber, account status or ban), the **expected status**
(per decisions A and its answers in [04](04-decisions-and-open-questions.md)), and the **side effects** (rows written, notifications, emails).
Add a failing regression test first for every confirmed defect, then fix. The matrix in [02](02-f01-account-state-matrix.md) is trace-only and must
not be treated as verified until this is done. Also verify the F-01c refresh claims (deleted branch 404 versus 401, banned user refresh).

## T-03 Dashboard and Mobile shared paths (before S2 to S6, S8 to S11, S13, S14)
Trace every shared Action, Service, Handler, Request and API entry point touched by a slice. Known shared surface: `Dashboard/Routes/Api/V1/mobile.php`
reuses the dashboard service CRUD and earnings actions behind `EnsureBranchAccountAccess` and `EnsureBarberAccountAccess`; the preference, currency,
language, category and lookup requests may also be used by the mobile apps. For each slice list the consumers (dashboard BFF, branch app, business
app, stylist app, client app), state each consumer's requirement, and add regression tests for **both** consumers where the behavior is shared
(for example: dashboard blocked for a suspended brand, mobile route unchanged). A contract change needs the mobile sync or a backward-compatible shape.

## T-04 Documentation consistency (every slice start)
Documentation reconciliation was done on 2026-11-14 (this commit). At the start of each slice re-check: decisions (D-01 to D-04, A to F and their
answers), findings status, slice dependencies in [05](05-implementation-plan.md), and the next-session instructions in [00](00-next-session-start.md).
Update them in the same commit as the slice. Record any new conflict in [04](04-decisions-and-open-questions.md) section F.
