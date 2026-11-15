# 00 Start here (next session)

Written 2026-11-14 (decision G-01 session). Next session scope: **implementation only**, following the verified dependency order of
[05](05-implementation-plan.md). Treat D-01 to D-04 as final.

## Approved decisions (final)
- **D-01:** `X-Dashboard-Session` is required for every Dashboard token; the claim is validated and its `sub` and `actor_type` are bound to the authenticated actor.
- **D-02:** refresh does not delete the previous access token (for now).
- **D-03:** Batch 2 stays outside scope until the owner defines it explicitly.
- **D-04:** WP-10 / billing / NS-26 / NS-27 stay deferred and outside scope.
- **G-01:** the single local documentation commit that recorded these (`docs(audit): finalize implementation decisions and handover`). Find it with
  `git log --oneline --grep "finalize implementation decisions"`.
- Earlier decisions A to F and their answers: [04](04-decisions-and-open-questions.md) sections A to D.

## Mandatory prerequisites (complete before the work they gate; details in [10](10-prerequisites-t01-t04.md))
- **T-01:** resolve the F-05 HTTP-status and evidence inconsistencies by tracing middleware registration and running each header state. Gates S1. **Audit done 2026-11-14** ([03](03-f05-session-lifecycle.md) section 5); S1 (F-05) is **done**: `tid` binding and durable revocation implemented, all gates passed 2026-11-15 ([03](03-f05-session-lifecycle.md) section 8.6), committed locally.
- **T-02:** verify F-01 runtime behavior per fix (actor, resource, lifecycle state, expected status, side effects); regression tests first. Gates S2 to S6.
- **T-03:** trace Dashboard/Mobile shared Actions and entry points; regression coverage for both consumers. Gates every slice that touches shared code.
- **T-04:** documentation and dependency-order consistency; re-check at the start of each slice.

## Startup checks (do these first)
1. `git status`, branch `master`, `git log -1`; confirm the G-01 commit is present and the tree holds no staged changes. Preserve unrelated user changes.
2. Read, in order: root `CLAUDE.md`, this file, [04](04-decisions-and-open-questions.md), [10](10-prerequisites-t01-t04.md), [05](05-implementation-plan.md),
   then [01](01-findings-register.md) and the detail file of the slice ([02](02-f01-account-state-matrix.md), [03](03-f05-session-lifecycle.md)), then
   `backend/CLAUDE.md`, `docs/decisions-required.md` and `.claude/skills/monorepo-task-executor/SKILL.md`.
3. The last cleanup removed generated files: run `flutter pub get` in `frontend/mobile` and `cd frontend/web/dashboard && npx next typegen` before analyzing or building.
4. Test database: MySQL 8.4 on 127.0.0.1:3307 (`composer test:db:up`); `dorak_test` only; never the development database.

## Start
**T-01, then S1** (F-05 mandatory claim). Then continue in the order of [05](05-implementation-plan.md) (S1, S10, S12, S2, S3, S4, S5, S6, S8, S9, S11,
S13, S14a onward, S7), one `monorepo-task-executor` task and one local commit per slice, with T-02 and T-03 completed before the slices they gate.
Stop and report on a failed gate, an undecided question or a conflict with a decision. Do not guess.

## Operational boundaries
- Commits stay local; never push or change remotes unless the owner explicitly asks. No `--no-verify`, no destructive git.
- Playwright only on `DB_DATABASE=dorak_test` with `TZ=UTC` and the recipe in [09](09-environment-and-gates.md); never stop servers of other projects.
- Do not read or edit `.env` files. PHPStan and Larastan stay excluded. Deployment and CI/CD stay outside scope.
- One slice per commit. Out of scope: Batch 2 (D-03), WP-10 (D-04).

## Remaining notes (non-blocking)
- Pushing the local commits is a standing rule (only on explicit request), not an open question.
- Handover work packages (WP-1, WP-3, WP-6, WP-4/5, WP-8b, WP-9, WP-2, WP-11) come after the slices; see [07](07-missing-features.md).

## F-05 final review (2026-11-15)
Audit: [03](03-f05-session-lifecycle.md) section 7. Fixes D-05 to D-07 implemented (section 8) and verified (section 8.6), committed locally. **S10** (F-03) done and committed locally 2026-11-15. S12 (F-09) and S2 (write guard foundation) done 2026-11-15. **Next slice: S3** (apply the guard to setup writes; remove its actions from `DashboardWriteExemptions::PENDING`).
