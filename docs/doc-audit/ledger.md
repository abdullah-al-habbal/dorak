---
nodeid: docs.doc-audit.ledger
parentnode: docs.doc-audit.policy
childnodes: []
codeanchors:
  - docs/
---

# Documentation audit ledger

Rules and verdict meanings: [policy](policy.md). Snapshot: commit `873d3edb9`, 2026-11-27. Temporary file.

## Coverage

523 tracked Markdown files, not counting the audit folder. Each appears once: as part of a logical document
below, or in a deferred `.claude/` row.

| Group | Files |
|---|---|
| Outside `.claude/` | 342 files = 183 logical documents |
| `.claude/`, deferred | 181 files |

This corrects the earlier plan's "285 logical documents", which grouped parts by filename only.

| Cluster | Logical documents | Reviewed |
|---|---|---|
| C0 pilot: push notifications | 2 | 2 |
| C1 agent guides and routers | 27 | 25 |
| C2 open work | 12 | 12 |
| C3 finished or running programmes | 10 | 10 |
| C4 backend and shared reference | 29 | 18 |
| C5 mobile and dashboard | 62 | 0 |
| C6 product intent and research | 41 | 0 |

The pilot also reads the push parts of `README.md`, the push handover and the backlog, which sit in C1 and C2.

## How to read the columns

- **Class, cluster, readers and risk are provisional.** A script assigned them from paths. I did not read every
  document, so a review may change them. "Readers" means intended readers; actual use wasn't measured.
- **C3 includes `docs/booking-concurrency/`**, which still has open work. "Temporary" doesn't mean safe to delete.
- **Refs** = other logical documents linking to it (`.claude/` files count individually) / router pages linking to it
  (`docs/index.md`, `docs/graph/`) / other tracked files naming it. The counts cover links to the hub or any part.
  The last number is approximate: ambiguous short names are skipped, and a bare `AGENTS.md`, `CLAUDE.md` or
  `README.md` counts for the root file. Zero doesn't prove that a file is unused.
- **Risk:** `high` = agent rules, routers, open work, operations, or a confirmed problem; `medium` = reference,
  decisions, temporary; `low` = intent and research.
- **`unreviewed`** says nothing about accuracy.

## Removed documents

| Document | Verdict | Cycle |
|---|---|---|
| `docs/sessions/handover-push-phase-2.md` | delete, applied | push pilot |
| `backend/process/process.md` | delete, applied: unused proposal naming a skills folder that doesn't exist | C1 backend |
| `frontend/mobile/references/codegen-policy.md` | merge into `frontend/mobile/AGENTS.md`, applied; counts and tables that code shows were dropped | C1 mobile root |
| `frontend/mobile/references/commands.md` | merge into `frontend/mobile/AGENTS.md`, applied; counts and tables that code shows were dropped | C1 mobile root |
| `frontend/mobile/references/dependency-layering.md` | merge into `frontend/mobile/AGENTS.md`, applied; counts and tables that code shows were dropped | C1 mobile root |
| `frontend/mobile/references/file-taxonomy.md` | merge into `frontend/mobile/AGENTS.md`, applied; counts and tables that code shows were dropped | C1 mobile root |
| `frontend/mobile/references/state-and-navigation.md` | merge into `frontend/mobile/AGENTS.md`, applied; counts and tables that code shows were dropped | C1 mobile root |
| `frontend/mobile/references/type-safety.md` | merge into `frontend/mobile/AGENTS.md`, applied; counts and tables that code shows were dropped | C1 mobile root |
| `frontend/mobile/references/root/commands.md` | merge into `frontend/mobile/AGENTS.md`, applied; counts and tables that code shows were dropped | C1 mobile root |
| `frontend/mobile/references/root/design-system.md` | merge into `frontend/mobile/AGENTS.md`, applied; counts and tables that code shows were dropped | C1 mobile root |
| `frontend/mobile/references/root/localization.md` | merge into `frontend/mobile/AGENTS.md`, applied; counts and tables that code shows were dropped | C1 mobile root |
| `frontend/mobile/references/root/non-negotiable-rules.md` | merge into `frontend/mobile/AGENTS.md`, applied; counts and tables that code shows were dropped | C1 mobile root |
| `frontend/mobile/references/root/per-unit-docs.md` | merge into `frontend/mobile/AGENTS.md`, applied; counts and tables that code shows were dropped | C1 mobile root |
| `frontend/mobile/references/root/repository-shape.md` | merge into `frontend/mobile/AGENTS.md`, applied; counts and tables that code shows were dropped | C1 mobile root |
| `frontend/mobile/references/root/where-new-code-goes.md` | merge into `frontend/mobile/AGENTS.md`, applied; counts and tables that code shows were dropped | C1 mobile root |
| `frontend/mobile/references/root/file-taxonomy.md` | merge into `frontend/mobile/AGENTS.md`, applied; counts and tables that code shows were dropped | C1 mobile root |
| `frontend/mobile/references/root/testing-conventions.md` | merge into `frontend/mobile/AGENTS.md`, applied; counts and tables that code shows were dropped | C1 mobile root |
| `frontend/mobile/references/root/backend-contract.md` | delete, applied: several listed backend defects are fixed; the client rules moved to the guide | C1 mobile root |
| `frontend/mobile/references/root/feature-inventory.md` | delete, applied: stale; the feature index owns this | C1 mobile root |
| `frontend/mobile/references/root/known-limitations.md` | extract then delete, applied: backlog TD-23 | C1 mobile root |
| `frontend/mobile/packages/design_system/references/gotchas-and-missing.md` | delete, applied: code lists this and the counts or claims were stale; gotchas moved to the package guide | C1 packages |
| `frontend/mobile/packages/design_system/references/tokens.md` | delete, applied: code lists this and the counts or claims were stale; gotchas moved to the package guide | C1 packages |
| `frontend/mobile/packages/design_system/references/widgets.md` | delete, applied: code lists this and the counts or claims were stale; gotchas moved to the package guide | C1 packages |
| `frontend/mobile/packages/localization/references/keys.md` | delete, applied: code lists this and the counts or claims were stale; gotchas moved to the package guide | C1 packages |
| `frontend/mobile/packages/core/references/gotchas.md` | delete, applied: inventories the code shows, copies of the core architecture and state contract, or stale claims (such as no current-user route); rules and non-obvious notes moved to the guide | C1 core |
| `frontend/mobile/packages/core/references/networking.md` | delete, applied: inventories the code shows, copies of the core architecture and state contract, or stale claims (such as no current-user route); rules and non-obvious notes moved to the guide | C1 core |
| `frontend/mobile/packages/core/references/repositories.md` | delete, applied: inventories the code shows, copies of the core architecture and state contract, or stale claims (such as no current-user route); rules and non-obvious notes moved to the guide | C1 core |
| `frontend/mobile/packages/core/references/session.md` | delete, applied: inventories the code shows, copies of the core architecture and state contract, or stale claims (such as no current-user route); rules and non-obvious notes moved to the guide | C1 core |
| `frontend/mobile/packages/core/references/state-management.md` | delete, applied: inventories the code shows, copies of the core architecture and state contract, or stale claims (such as no current-user route); rules and non-obvious notes moved to the guide | C1 core |
| `frontend/mobile/packages/core/references/storage.md` | delete, applied: inventories the code shows, copies of the core architecture and state contract, or stale claims (such as no current-user route); rules and non-obvious notes moved to the guide | C1 core |
| `frontend/mobile/packages/core/references/tests.md` | delete, applied: inventories the code shows, copies of the core architecture and state contract, or stale claims (such as no current-user route); rules and non-obvious notes moved to the guide | C1 core |
| `frontend/mobile/packages/core/references/verification.md` | delete, applied: inventories the code shows, copies of the core architecture and state contract, or stale claims (such as no current-user route); rules and non-obvious notes moved to the guide | C1 core |
| `frontend/mobile/apps/client_app/references/bootstrap-and-flows.md` | delete, applied: stale flows, counts and status that the code and feature index own | C1 apps |
| `frontend/mobile/apps/client_app/references/feature-status.md` | delete, applied: stale flows, counts and status that the code and feature index own | C1 apps |
| `frontend/mobile/apps/client_app/references/tests.md` | delete, applied: stale flows, counts and status that the code and feature index own | C1 apps |
| `frontend/mobile/apps/client_app/references/verification.md` | delete, applied: stale flows, counts and status that the code and feature index own | C1 apps |
| `frontend/mobile/references/root/decisions.md` | merge into the client app decisions, applied | C1 apps |
| `backend/docs/14-execution-status.md` | delete, applied: the AI "stub" claim was false (F2); the rest is stale or owned by the backlog and the product document | C2 |
| `docs/frontend-arch-review/01-executive-summary.md` | delete, applied: all 13 findings closed (spot-checked in code); the dialog-loading and dictionary reasons moved to `src/README.md` | C3 architecture review |
| `docs/frontend-arch-review/02-components-and-hooks.md` | delete, applied: all 13 findings closed (spot-checked in code); the dialog-loading and dictionary reasons moved to `src/README.md` | C3 architecture review |
| `docs/frontend-arch-review/03-state-management-and-react.md` | delete, applied: all 13 findings closed (spot-checked in code); the dialog-loading and dictionary reasons moved to `src/README.md` | C3 architecture review |
| `docs/frontend-arch-review/04-data-flow-and-api.md` | delete, applied: all 13 findings closed (spot-checked in code); the dialog-loading and dictionary reasons moved to `src/README.md` | C3 architecture review |
| `docs/frontend-arch-review/05-files-and-code-organization.md` | delete, applied: all 13 findings closed (spot-checked in code); the dialog-loading and dictionary reasons moved to `src/README.md` | C3 architecture review |
| `docs/frontend-arch-review/06-types-and-validation.md` | delete, applied: all 13 findings closed (spot-checked in code); the dialog-loading and dictionary reasons moved to `src/README.md` | C3 architecture review |
| `docs/frontend-arch-review/07-dependencies-and-module-boundaries.md` | delete, applied: all 13 findings closed (spot-checked in code); the dialog-loading and dictionary reasons moved to `src/README.md` | C3 architecture review |
| `docs/frontend-arch-review/08-maintainability-and-technical-debt.md` | delete, applied: all 13 findings closed (spot-checked in code); the dialog-loading and dictionary reasons moved to `src/README.md` | C3 architecture review |
| `docs/frontend-arch-review/09-prioritized-action-plan.md` | delete, applied: all 13 findings closed (spot-checked in code); the dialog-loading and dictionary reasons moved to `src/README.md` | C3 architecture review |
| `docs/frontend-arch-review/10-performance-and-bundle.md` | delete, applied: all 13 findings closed (spot-checked in code); the dialog-loading and dictionary reasons moved to `src/README.md` | C3 architecture review |
| `docs/frontend-arch-review/11-resolution-status.md` | delete, applied: all 13 findings closed (spot-checked in code); the dialog-loading and dictionary reasons moved to `src/README.md` | C3 architecture review |
| `docs/frontend-arch-review/index.md` | delete, applied: all 13 findings closed (spot-checked in code); the dialog-loading and dictionary reasons moved to `src/README.md` | C3 architecture review |
| `docs/mobile-audit-g10-g11/01-dto-is-active-bug.md` | delete, applied: findings fixed in code or tracked in the backlog (TD-1, 2, 6, FT-2); the scope decision is ADR 0002 | C3 mobile gap audit |
| `docs/mobile-audit-g10-g11/02-token-scope-mismatch.md` | delete, applied: findings fixed in code or tracked in the backlog (TD-1, 2, 6, FT-2); the scope decision is ADR 0002 | C3 mobile gap audit |
| `docs/mobile-audit-g10-g11/03-inbox-scope-definition.md` | delete, applied: findings fixed in code or tracked in the backlog (TD-1, 2, 6, FT-2); the scope decision is ADR 0002 | C3 mobile gap audit |
| `docs/mobile-audit-g10-g11/04-navigation-shell-gap.md` | delete, applied: findings fixed in code or tracked in the backlog (TD-1, 2, 6, FT-2); the scope decision is ADR 0002 | C3 mobile gap audit |
| `docs/mobile-audit-g10-g11/05-missing-backend-routes.md` | delete, applied: findings fixed in code or tracked in the backlog (TD-1, 2, 6, FT-2); the scope decision is ADR 0002 | C3 mobile gap audit |
| `docs/mobile-audit-g10-g11/06-mvp-scope-decisions.md` | delete, applied: findings fixed in code or tracked in the backlog (TD-1, 2, 6, FT-2); the scope decision is ADR 0002 | C3 mobile gap audit |
| `docs/mobile-audit-g10-g11/index.md` | delete, applied: findings fixed in code or tracked in the backlog (TD-1, 2, 6, FT-2); the scope decision is ADR 0002 | C3 mobile gap audit |
| `docs/planning/existing-frontend-audit-part-2.md` | delete, applied: inventory of the removed first dashboard (F5); ADR 0003 and 0004 hold the decisions | C3 planning |
| `docs/planning/existing-frontend-audit-part-3.md` | delete, applied: inventory of the removed first dashboard (F5); ADR 0003 and 0004 hold the decisions | C3 planning |
| `docs/planning/existing-frontend-audit-part-4.md` | delete, applied: inventory of the removed first dashboard (F5); ADR 0003 and 0004 hold the decisions | C3 planning |
| `docs/planning/existing-frontend-audit.md` | delete, applied: inventory of the removed first dashboard (F5); ADR 0003 and 0004 hold the decisions | C3 planning |
| `docs/planning/product-audit-part-2.md` | delete, applied: findings G1 to G17 are resolved and the workflow matrix predates the Filament removal | C3 planning |
| `docs/planning/product-audit-part-3.md` | delete, applied: findings G1 to G17 are resolved and the workflow matrix predates the Filament removal | C3 planning |
| `docs/planning/product-audit.md` | delete, applied: findings G1 to G17 are resolved and the workflow matrix predates the Filament removal | C3 planning |
| `docs/planning/remediation-plan-part-2.md` | extract then delete, applied: the in-person payment rule moved to the backlog; the rest is stale or in code (F18) | C3 planning |
| `docs/planning/remediation-plan.md` | extract then delete, applied: the in-person payment rule moved to the backlog; the rest is stale or in code (F18) | C3 planning |
| `docs/planning/dashboard-refactor-batch-3.md` | delete, applied: every step is done; the primitives are listed in the task executor's shared-primitives reference | C3 planning |
| `docs/readiness/index.md` | extract then delete, applied: T1 to T12 and T14 to T16 are done or skipped; open items and owner decisions moved to the backlog (BG-4, BG-15, RR-5, RR-7, RR-21) | C3 readiness |
| `docs/readiness/t01-mobile-release-config.md` | extract then delete, applied: T1 to T12 and T14 to T16 are done or skipped; open items and owner decisions moved to the backlog (BG-4, BG-15, RR-5, RR-7, RR-21) | C3 readiness |
| `docs/readiness/t02-backend-legal-pages.md` | extract then delete, applied: T1 to T12 and T14 to T16 are done or skipped; open items and owner decisions moved to the backlog (BG-4, BG-15, RR-5, RR-7, RR-21) | C3 readiness |
| `docs/readiness/t03-dashboard-legal-content.md` | extract then delete, applied: T1 to T12 and T14 to T16 are done or skipped; open items and owner decisions moved to the backlog (BG-4, BG-15, RR-5, RR-7, RR-21) | C3 readiness |
| `docs/readiness/t04-backend-feedback.md` | extract then delete, applied: T1 to T12 and T14 to T16 are done or skipped; open items and owner decisions moved to the backlog (BG-4, BG-15, RR-5, RR-7, RR-21) | C3 readiness |
| `docs/readiness/t05-dashboard-support-inbox.md` | extract then delete, applied: T1 to T12 and T14 to T16 are done or skipped; open items and owner decisions moved to the backlog (BG-4, BG-15, RR-5, RR-7, RR-21) | C3 readiness |
| `docs/readiness/t06-barber-account-deletion.md` | extract then delete, applied: T1 to T12 and T14 to T16 are done or skipped; open items and owner decisions moved to the backlog (BG-4, BG-15, RR-5, RR-7, RR-21) | C3 readiness |
| `docs/readiness/t07-branch-account-deletion.md` | extract then delete, applied: T1 to T12 and T14 to T16 are done or skipped; open items and owner decisions moved to the backlog (BG-4, BG-15, RR-5, RR-7, RR-21) | C3 readiness |
| `docs/readiness/t08-mobile-shared-layer.md` | extract then delete, applied: T1 to T12 and T14 to T16 are done or skipped; open items and owner decisions moved to the backlog (BG-4, BG-15, RR-5, RR-7, RR-21) | C3 readiness |
| `docs/readiness/t09-mobile-app-integration.md` | extract then delete, applied: T1 to T12 and T14 to T16 are done or skipped; open items and owner decisions moved to the backlog (BG-4, BG-15, RR-5, RR-7, RR-21) | C3 readiness |
| `docs/readiness/t10-public-barber-resource.md` | extract then delete, applied: T1 to T12 and T14 to T16 are done or skipped; open items and owner decisions moved to the backlog (BG-4, BG-15, RR-5, RR-7, RR-21) | C3 readiness |
| `docs/readiness/t11-privacy-checks.md` | extract then delete, applied: T1 to T12 and T14 to T16 are done or skipped; open items and owner decisions moved to the backlog (BG-4, BG-15, RR-5, RR-7, RR-21) | C3 readiness |
| `docs/readiness/t12-dashboard-web-hygiene.md` | extract then delete, applied: T1 to T12 and T14 to T16 are done or skipped; open items and owner decisions moved to the backlog (BG-4, BG-15, RR-5, RR-7, RR-21) | C3 readiness |
| `docs/readiness/t13-docs-and-gates.md` | extract then delete, applied: T1 to T12 and T14 to T16 are done or skipped; open items and owner decisions moved to the backlog (BG-4, BG-15, RR-5, RR-7, RR-21) | C3 readiness |
| `docs/readiness/t14-owner-mobile-backend-api.md` | extract then delete, applied: T1 to T12 and T14 to T16 are done or skipped; open items and owner decisions moved to the backlog (BG-4, BG-15, RR-5, RR-7, RR-21) | C3 readiness |
| `docs/readiness/t15-owner-mobile-core-layer.md` | extract then delete, applied: T1 to T12 and T14 to T16 are done or skipped; open items and owner decisions moved to the backlog (BG-4, BG-15, RR-5, RR-7, RR-21) | C3 readiness |
| `docs/readiness/t16-business-app-owner-experience.md` | extract then delete, applied: T1 to T12 and T14 to T16 are done or skipped; open items and owner decisions moved to the backlog (BG-4, BG-15, RR-5, RR-7, RR-21) | C3 readiness |
| `docs/feature-modules-plan.md` | extract then delete, applied: all twelve modules are built; proxy and error rules moved to the frontend architecture guide, state and data rules to the dashboard source layout, one decision to the backlog. Not moved because the code disagrees or has moved on: branch time zone (F19), sheets for long forms, the chair floor-plan and brand approve-only limits | C3 feature modules plan |
| `docs/booking-concurrency/08-remediation-plan.md` | extract then delete, applied: its order repeats the backlog, waves and fix order; the database backstop is now TD-25 and the ship checklist is in the index | C3 booking concurrency |
| `backend/modules/Website/docs/09-c4-context.md` | delete: pre-code architecture that the code contradicts (no page analytics); no unique rule | C4 website module |
| `backend/modules/Website/docs/10-c4-containers.md` | delete: pre-code container sketch; the structure is the module itself | C4 website module |
| `backend/modules/Website/docs/11-frontend-architecture.md` | delete: pre-code structure the code contradicts (`/` isn't redirected to a language prefix); the theming and rendering rules are in the house rules | C4 website module |

## Findings so far

These are examples from spot checks, not the result of a full review.

| ID | Finding | Evidence |
|---|---|---|
| F1 | The push document says the Phase 2 backend isn't deployed to dev, and `README.md` calls Phase 2 local. Both are out of date. | `aa144ecbe` and `4897540c0` are ancestors of `7b3814481`, recorded as deployed in dev status Snapshot 13. Not probed live. |
| F2 | `backend/docs/14-execution-status.md` calls `AnalyzeFacePhotoJob` an MVP stub. The code sends the stored image to an AI agent. Backlog BG-14 agrees with the code. | `AnalyzeFacePhotoJob.php`, `FaceAnalysisService.php`. Live provider setup not checked. |
| F3 | The entity model part 7 says content came from `prd.md`; there is no `backend/docs/prd.md`. It is migration history in a reference document. | `backend/docs/06-entity-model-abstract-part-7.md`, section 6 |
| F4 | Root `AGENTS.md` and `CLAUDE.md` overlap but each has its own content; nested pairs aren't mirrors. | [Policy, section 5](policy.md) |
| F5 | Two audits in `docs/planning/` have back-links that loop between a hub and part 2. The existing-frontend audit also holds all 6 unresolved code anchors (of 638), which point at the removed legacy dashboard. | back-link and anchor scripts, 2026-11-27 |
| F6 | Outside Markdown: two workflows name `docs/16-deployment-operations.md`, which doesn't exist; the document is under `backend/docs/`. `backend/scripts/check_migrations.php` also names it; its path wasn't checked. | `backend-ci.yml:73`, `deploy.yml:223` |
| F7 | Push rules conflicted. Decided (DA-1). | root `AGENTS.md` and `CLAUDE.md`; `docs/backlog/index.md:183`; `docs/waves/index.md:64` |
| F8 | The session board's registry looks out of date: it lists unowned working-tree edits, but the tree was clean when this audit began. Of the sessions on this machine, only one other is live and it isn't in the registry. Cloud sessions and other computers couldn't be listed. | `docs/sessions/index.md`, `git status`, session list |
| F9 | `docs/index.md` says every maintained document is listed, apart from stated exclusions. Some outside those exclusions have no router link, for example `backend/docs/17-sms-delivery.md` and `backend/docs/api-response-standard.md`. They may be reachable through a sub-index. | router count of 0 in the tables |
| F10 | The backend guides said a Husky pre-push hook runs the backend gates and that CI only checks formatting. Git uses the root `.husky/`, which has no `pre-push`; `backend/.husky/pre-push` never runs. CI runs the guard, Pint, tests and concurrency tests. Guides corrected. **Owner: restore a local gate, or leave CI as the gate?** | `git config core.hooksPath`, `.husky/_/h`, `backend-ci.yml` Resolved 2026-11-27: the gate is now in the root hook. |
| F11 | Rule "config `env()` calls take no default" isn't followed in `broadcasting.php`, `dashboard.php`, `sanctum.php` and the published `backend/config/` files. Rule kept. **Owner: scope the rule to module config, or fix the code?** | `grep` of `env('X', …)`, 2026-11-27 Resolved 2026-11-27 for module config (`view.php` was a fourth file); published config exempt. |
| F12 | The mobile root references contradicted the code: favorites "no backend route" (routes exist), "no verify-reset-code endpoint" (it exists and the bloc calls it), "no GET current user" (restore loads the profile), three different localization key counts (670 now), `bloc_concurrency` "not a dependency" (client app has it), `core` verify "all five" steps (four). Corrected or removed. | `client-interaction.php:19`, `password_recovery.bloc.dart:65`, `session.bloc.dart:93`, ARB count, `pubspec.yaml` |
| F13 | Two mobile rule files disagreed: "exactly one top-level class" against "one public class, private helpers allowed"; theme files "allowed in apps" against the taxonomy tool (design system only). Kept the second reading of the first, which the older guide documented as used, and the tool's rule for the second. | former `CLAUDE.md`, `non-negotiable-rules.md`, `tool/check_taxonomy.dart` |
| F14 | Checked the realtime claims added by `99311f495`: the dashboard has no realtime client or `/api/realtime` route, no app subscribes to the floor-plan channel (text search), and the events listed per channel match each event's `broadcastOn`. Not checked: "once per real status change" and the recorded test and CI results. The commits it lists as delivered are ancestors of `7b3814481`. | `modules/*/Events/`, `frontend/web/dashboard/src`, `git merge-base` |
| F15 | Open work in the backlog was already done or out of date: BG-13 (fix committed and gated), TD-4 (all 99 keys named are used), RR-2 (struck through), the TD-8 "no `version` column" claim, the TS-4 "`invitations.spec.ts` has never run" note (the full suite on `a712aca7f` includes the file; inferred from the Playwright config), the RR-7 note about uncommitted edits, and a pointer to a deleted mobile inventory in BD-6. | `c386493f2`, ARB key search, `create_branch_products_table.php`, `playwright.config.ts`, `git status` |
| F16 | The runbook's second Playwright trap isn't reproduced. The E2E guard checks only the test process, not the server's database. Logged as BG-54, unconfirmed. | `e2e-database-guard.ts`, `playwright.config.ts`, framework `ServeCommand.php` |
| F17 | `02-prd` section 8, "locked implementation decisions", item 5 says not to build real-time socket occupancy tracking. The code broadcasts chair status over Reverb, and the owner later approved the realtime wave. **Resolved (owner, 2026-11-27):** marked superseded in PRD section 8, house rule L3 and technical concepts part 16; recorded in the backlog. | `backend/docs/02-prd-part-3.md`, `ChairStatusUpdated`, wave 1 |
| F18 | The deleted "MVP Alignment Policies" page was presented as permanent but was wrong: it allowed no `confirmed` to `no_show` transition (the enum already did), and its floor-plan parameters, FCM key name and repository layout were out of date. Only the in-person payment rule was unique; it is now a decision in force. | `BookingStatus.php`, floor plan request, `CreateBookingRequest.php` |
| F19 | **High, owner decision:** opening hours and barber schedules are compared in UTC with no salon time zone (BG-55), and the client app sends the previous day for slots east of UTC (BG-56). The module plan said the branch time zone is used for display and slot math; no such zone exists. Reproduced by skipped tests on 2026-11-27 (full backend suite: 3016 passed, 3 skipped; `melos run verify` passed). The owner chose a time zone per branch | `BranchHours.php`, `BarberScheduleAvailability.php`, `branch.repository.dart`, `booking.repository.dart` |

## Push record

The owner pushed `master` to `origin` on 2026-11-27, up to `6aa3d73d0` (`git fetch`, then no commits either way).
On that commit Backend CI `46049039941` passed (migration guard, Pint, 3016 tests, 12 concurrency tests), Mobile CI
`46049039908` passed analyze and test, and the Vercel status was `success`. No backend deploy followed. Audit
commits after `6aa3d73d0` stay local until the owner asks for a push (DA-1).

## Routing

The audit folder is temporary and isn't listed in `docs/index.md`. It is claimed on the session board.

## C0 pilot: push notifications

| Logical document | Files | Lines | Class | Readers | Doc / router / other refs | Risk | Verdict |
|---|---|---|---|---|---|---|---|
| `docs/architecture/push-notifications.md` | 1 | 135 | Reference | engineers, agents | 8 / 1 / 0 | high | fix, applied |
| `docs/deployment/dev-environment-status.md` | 1 | 93 | Operations | operators, agents | 12 / 1 / 0 | high | fix, applied |

## C1 agent guides and routers

| Logical document | Files | Lines | Class | Readers | Doc / router / other refs | Risk | Verdict |
|---|---|---|---|---|---|---|---|
| `AGENTS.md` | 1 | 128 | Rules | agents, engineers | 4 / 1 / 4 | high | fix, applied |
| `CLAUDE.md` | 1 | 11 | Rules | agents, engineers | 1 / 1 / 5 | high | merge into AGENTS.md, applied (now an import) |
| `README.md` (also in C0) | 1 | 146 | Router | agents, engineers | 9 / 1 / 3 | high | merge parts, fix, applied |
| `backend/AGENTS.md` | 1 | 128 | Rules | agents, engineers | 5 / 2 / 10 | high | fix + merge CLAUDE and part 2, applied |
| `backend/CLAUDE.md` | 1 | 9 | Rules | agents, engineers | 3 / 1 / 1 | high | merge into AGENTS.md, applied (now an import) |
| `docs/graph/repo-index.md` | 1 | 29 | Router | agents, engineers | 0 / 1 / 0 | high | unreviewed |
| `docs/index.md` | 6 | 487 | Router | agents, engineers | 34 / 1 / 0 | high | unreviewed |
| `frontend/mobile/AGENTS.md` | 1 | 150 | Rules | agents, engineers | 24 / 2 / 1 | high | fix, applied (C1 mobile root) |
| `frontend/mobile/CLAUDE.md` | 1 | 10 | Rules | agents, engineers | 15 / 1 / 1 | high | merge into `AGENTS.md`, applied (import only) |
| `frontend/mobile/apps/business_app/AGENTS.md` | 1 | 32 | Rules | agents, engineers | 5 / 1 / 0 | high | fix, applied (C1 apps); behaviour and flow notes not rechecked |
| `frontend/mobile/apps/business_app/CLAUDE.md` | 1 | 9 | Rules | agents, engineers | 4 / 1 / 0 | high | merge into `AGENTS.md`, applied (import only) |
| `frontend/mobile/apps/client_app/AGENTS.md` | 1 | 41 | Rules | agents, engineers | 8 / 1 / 0 | high | fix, applied (C1 apps); behaviour and flow notes not rechecked |
| `frontend/mobile/apps/client_app/CLAUDE.md` | 1 | 9 | Rules | agents, engineers | 5 / 1 / 0 | high | merge into `AGENTS.md`, applied (import only) |
| `frontend/mobile/apps/client_app/references/decisions.md` | 1 | 69 | Rules | agents, engineers | 1 / 0 / 0 | high | fix, applied: one list now; most rows not rechecked |
| `frontend/mobile/apps/stylist_app/AGENTS.md` | 1 | 32 | Rules | agents, engineers | 6 / 1 / 0 | high | fix, applied (C1 apps); behaviour and flow notes not rechecked |
| `frontend/mobile/apps/stylist_app/CLAUDE.md` | 1 | 9 | Rules | agents, engineers | 4 / 1 / 0 | high | merge into `AGENTS.md`, applied (import only) |
| `frontend/mobile/packages/core/AGENTS.md` | 1 | 57 | Rules | agents, engineers | 10 / 1 / 0 | high | fix, applied (C1 core); feed cache and auth interceptor notes not rechecked |
| `frontend/mobile/packages/core/CLAUDE.md` | 1 | 9 | Rules | agents, engineers | 6 / 1 / 0 | high | merge into `AGENTS.md`, applied (import only) |
| `frontend/mobile/packages/design_system/AGENTS.md` | 1 | 41 | Rules | agents, engineers | 7 / 1 / 1 | high | fix, applied (C1 packages) |
| `frontend/mobile/packages/design_system/CLAUDE.md` | 1 | 9 | Rules | agents, engineers | 4 / 1 / 0 | high | merge into `AGENTS.md`, applied (import only) |
| `frontend/mobile/packages/feature_error_feedback/AGENTS.md` | 1 | 31 | Rules | agents, engineers | 4 / 0 / 0 | high | fix, applied (C1 packages) |
| `frontend/mobile/packages/feature_error_feedback/CLAUDE.md` | 1 | 9 | Rules | agents, engineers | 3 / 0 / 0 | high | merge into `AGENTS.md`, applied (import only) |
| `frontend/mobile/packages/localization/AGENTS.md` | 1 | 36 | Rules | agents, engineers | 5 / 1 / 1 | high | fix, applied (C1 packages) |
| `frontend/mobile/packages/localization/CLAUDE.md` | 1 | 9 | Rules | agents, engineers | 4 / 1 / 0 | high | merge into `AGENTS.md`, applied (import only) |
| `frontend/mobile/references/root/core-architecture.md` | 1 | 138 | Rules | agents, engineers | 1 / 0 / 0 | high | fix, applied; envelope, exception table and bloc event names not rechecked |
| `frontend/web/dashboard/AGENTS.md` | 1 | 118 | Rules | agents, engineers | 4 / 2 / 1 | high | keep: named paths, scripts, shared hooks, memo row and E2E database guard checked; behaviour rules not rechecked |
| `frontend/web/dashboard/CLAUDE.md` | 1 | 9 | Rules | agents, engineers | 2 / 1 / 1 | high | keep: already an `@AGENTS.md` import |

## C2 open work

| Logical document | Files | Lines | Class | Readers | Doc / router / other refs | Risk | Verdict |
|---|---|---|---|---|---|---|---|
| `docs/backlog/index.md` (push rows in C0) | 1 | 190 | Open work | owner, agents | 31 / 2 / 3 | high | fix, applied (C2). Checked in code: BG-4, 12, 14, 16, 18, 21, 27 to 35, 39, 41, 45, 49; BD-10, 11, 15; TD-1, 5, 8, 12, 20; FT-18, 19; RR-5, 6, 9, 13. Checked only in part: BG-20, 36, 40, 46, 47, 51; TD-19; FT-1, 17; TS-4. Every other row wasn't rechecked |
| `docs/sessions/index.md` | 1 | 57 | Open work | owner, agents | 6 / 1 / 0 | high | fix, applied (C2): ownerless-edits row removed, claims marked as records, Q-8 answered; older log rows not rechecked |
| `docs/waves/index.md` | 1 | 131 | Open work | owner, agents | 12 / 1 / 0 | high | fix, applied (C2): push, CI and wave status; local-only and dev results from earlier trees not rerun |
| `docs/waves/runbook.md` | 1 | 130 | Operations | operators, agents | 9 / 1 / 2 | high | keep: composer, npm and melos scripts, test database ports, release script and realtime script steps checked; procedures not run; Playwright trap 2 not reproduced (F16) |
| `docs/waves/wave-0.md` | 1 | 42 | Open work | owner, agents | 1 / 1 / 0 | high | keep: cited commits are on master and Snapshots 11 and 12 exist in Git; CI and deploy results not rechecked. Delete with the programme |
| `docs/waves/wave-1-decisions.md` | 1 | 47 | Decisions | owner, engineers | 3 / 1 / 0 | medium | keep: waiting for the owner; third-party prices and limits are marked unconfirmed and weren't rechecked |
| `docs/waves/wave-1.md` | 1 | 49 | Open work | owner, agents | 2 / 1 / 0 | high | keep: cited commits are on master and the code for BG-45, 46, 47 and 51 was spot-checked; local run results not rerun |
| `docs/waves/wave-2.md` | 1 | 39 | Open work | owner, agents | 1 / 1 / 0 | high | keep: tasks match open backlog rows checked in this cycle (BG-50 advisories not rerun) |
| `docs/waves/wave-3.md` | 1 | 41 | Open work | owner, agents | 1 / 1 / 0 | high | keep: tasks match open backlog rows checked in this cycle |
| `docs/waves/wave-4.md` | 1 | 37 | Open work | owner, agents | 1 / 1 / 0 | high | keep: tasks match open backlog rows (BG-19 query counts not remeasured) |
| `docs/waves/wave-5.md` | 1 | 37 | Open work | owner, agents | 1 / 1 / 0 | high | fix, applied (C2): W5.2 and W5.7 done |
| `docs/waves/wave-6.md` | 1 | 34 | Open work | owner, agents | 1 / 1 / 0 | high | fix, applied (C2): dropped TD-10, linked this audit |

## C3 finished or running programmes

| Logical document | Files | Lines | Class | Readers | Doc / router / other refs | Risk | Verdict |
|---|---|---|---|---|---|---|---|
| `docs/booking-concurrency/01-lock-order-and-deadlocks.md` | 1 | 77 | Temporary | history; agents if linked | 6 / 1 / 0 | medium | keep (link fixed): open claims match the backlog; code changes since the review are the ones it describes; line numbers not rechecked one by one |
| `docs/booking-concurrency/02-overlap-guards.md` | 1 | 51 | Temporary | history; agents if linked | 4 / 1 / 0 | medium | fix, applied: BD-10 was shown as open |
| `docs/booking-concurrency/03-idempotency-and-uniqueness.md` | 1 | 96 | Temporary | history; agents if linked | 7 / 1 / 0 | medium | fix, applied: stale BD-10 and working-tree wording; the Reported gaps stay unverified |
| `docs/booking-concurrency/04-hashing-and-tokens.md` | 1 | 42 | Temporary | history; agents if linked | 5 / 1 / 0 | medium | keep: the md5 hash and the plain email-code comparison still match; the other rows stay as graded in the file |
| `docs/booking-concurrency/05-search-and-availability.md` | 1 | 59 | Temporary | history; agents if linked | 2 / 1 / 0 | medium | fix, applied: the UTC question is now answered (BG-55); query counts not measured again |
| `docs/booking-concurrency/06-client-sync-and-ux.md` | 1 | 60 | Temporary | history; agents if linked | 3 / 1 / 0 | medium | keep (link fixed): matches BG-20 and BG-21; app code not read again beyond those |
| `docs/booking-concurrency/07-test-coverage.md` | 1 | 59 | Temporary | history; agents if linked | 5 / 1 / 0 | medium | fix, applied: test count and BD-10 |
| `docs/booking-concurrency/09-write-path-audit.md` | 1 | 52 | Temporary | history; agents if linked | 6 / 1 / 0 | medium | fix, applied: BD-11 is decided; W claims checked with BG-27 to BG-35 in C2 |
| `docs/booking-concurrency/10-fix-order.md` | 1 | 64 | Temporary | history; agents if linked | 7 / 1 / 0 | medium | fix, applied: BD-11 and BD-12 were listed as open; old no-push rule |
| `docs/booking-concurrency/index.md` | 1 | 90 | Temporary | history; agents if linked | 12 / 1 / 0 | medium | fix, applied: dated status replaced by a pointer to the backlog; BD-10 shown as decided |

## C4 backend and shared reference

| Logical document | Files | Lines | Class | Readers | Doc / router / other refs | Risk | Verdict |
|---|---|---|---|---|---|---|---|
| `backend/README.md` | 1 | 19 | Reference | engineers, agents | 1 / 1 / 0 | medium | fix + merge parts, applied |
| `backend/docs/04-house-rules.md` | 3 | 184 | Decisions | owner, engineers | 1 / 1 / 1 | medium | unreviewed |
| `backend/docs/05-domain-glossary.md` | 2 | 98 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `backend/docs/06-entity-model-abstract.md` | 13 | 661 | Reference | engineers, agents | 1 / 1 / 0 | high | fix (F3) |
| `backend/docs/09-c4-context.md` | 2 | 88 | Reference | engineers, agents | 1 / 1 / 0 | medium | keep as product intent: actors and external services; the later services are named from 10 |
| `backend/docs/10-c4-containers.md` | 3 | 152 | Reference | engineers, agents | 1 / 1 / 0 | medium | fix, applied: one client app became three, a dead skill path, and later services noted |
| `backend/docs/11-backend-architecture.md` | 20 | 1012 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `backend/docs/13-technical-concepts.md` | 21 | 1138 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `backend/docs/16-deployment-operations.md` | 11 | 654 | Operations | operators, agents | 0 / 1 / 4 | high | unreviewed |
| `backend/docs/17-sms-delivery.md` | 1 | 51 | Reference | engineers, agents | 0 / 0 / 0 | medium | fix, applied: the production boot guard was missing |
| `backend/docs/README.md` | 3 | 145 | Reference | engineers, agents | 1 / 2 / 0 | medium | unreviewed |
| `backend/docs/api-response-standard.md` | 1 | 28 | Reference | engineers, agents | 0 / 0 / 0 | medium | keep: every named class and the architecture test exist |
| `backend/docs/feature-index.md` | 8 | 651 | Reference | engineers, agents | 3 / 1 / 0 | medium | unreviewed |
| `backend/modules/Website/docs/04-house-rules.md` | 1 | 27 | Decisions | owner, engineers | 1 / 1 / 0 | medium | keep as product intent: not rewritten to match code; each rule not checked against the site |
| `backend/modules/Website/docs/05-domain-glossary.md` | 1 | 16 | Reference | engineers, agents | 1 / 1 / 0 | medium | keep as product intent: vocabulary only |
| `backend/modules/Website/docs/06-content-and-ui-model-abstract.md` | 1 | 43 | Reference | engineers, agents | 1 / 1 / 0 | medium | keep as product intent: not checked against the marketing models |
| `backend/modules/Website/docs/README.md` | 1 | 51 | Reference | engineers, agents | 0 / 1 / 0 | medium | fix, applied: it claimed to be the truth before any code existed |
| `docs/adr/0001-brand-owner-as-client.md` | 1 | 64 | Decisions | owner, engineers | 1 / 1 / 0 | medium | keep with a dated note: the owner notification bell changed |
| `docs/adr/0002-mvp-scope-deferrals.md` | 1 | 45 | Decisions | owner, engineers | 3 / 1 / 1 | medium | keep: a dated decision record; whether its scope is still met wasn't checked feature by feature |
| `docs/adr/0003-new-dashboard-foundation.md` | 1 | 41 | Decisions | owner, engineers | 4 / 1 / 0 | medium | keep with a dated note: all three listed gaps have since changed (forgot and reset routes seen; the other two rest on the guard test and the backlog decision) |
| `docs/adr/0004-archive-legacy-dashboard.md` | 1 | 47 | Decisions | owner, engineers | 4 / 1 / 0 | medium | keep: history of a finished move; no live claim depends on it |
| `docs/architecture/architecture.md` | 1 | 64 | Reference | engineers, agents | 4 / 1 / 0 | medium | fix, applied: dashboard auth path and production settings were wrong |
| `docs/architecture/frontend-architecture.md` | 1 | 55 | Reference | engineers, agents | 1 / 2 / 0 | medium | fix, applied in C3: proxy and error rules added and checked against the forwarder |
| `docs/architecture/localization-of-machine-keys.md` | 1 | 59 | Reference | engineers, agents | 7 / 1 / 1 | medium | keep (status lines trimmed): enum count (45) and named tests match |
| `docs/architecture/testing-strategy.md` | 1 | 198 | Reference | engineers, agents | 7 / 1 / 2 | medium | fix, applied: CI table was out of date; CI workflows, named tests checked; the rest not rechecked |
| `docs/deployment/ci-cd-setup.md` | 1 | 139 | Operations | operators, agents | 7 / 1 / 1 | high | unreviewed |
| `docs/deployment/deployment-guide.md` | 3 | 175 | Operations | operators, agents | 5 / 1 / 0 | high | unreviewed |
| `docs/deployment/hostinger-questions.md` | 1 | 114 | Operations | operators, agents | 2 / 1 / 0 | high | unreviewed |
| `docs/deployment/vercel-dashboard.md` | 1 | 83 | Operations | operators, agents | 5 / 1 / 0 | high | unreviewed |

## C5 mobile and dashboard

| Logical document | Files | Lines | Class | Readers | Doc / router / other refs | Risk | Verdict |
|---|---|---|---|---|---|---|---|
| `frontend/mobile/apps/business_app/README.md` | 1 | 14 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/apps/business_app/docs/feature-index.md` | 1 | 47 | Reference | engineers, agents | 2 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/apps/business_app/ios/Runner/Assets.xcassets/LaunchImage.imageset/README.md` | 1 | 13 | Reference | engineers, agents | 0 / 0 / 0 | medium | unreviewed |
| `frontend/mobile/apps/client_app/README.md` | 1 | 14 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/apps/client_app/docs/feature-index.md` | 4 | 231 | Reference | engineers, agents | 2 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/apps/client_app/docs/runtime/app-lifecycle.md` | 4 | 215 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/apps/client_app/ios/Runner/Assets.xcassets/LaunchImage.imageset/README.md` | 1 | 13 | Reference | engineers, agents | 0 / 0 / 0 | medium | unreviewed |
| `frontend/mobile/apps/stylist_app/README.md` | 1 | 14 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/apps/stylist_app/docs/feature-index.md` | 1 | 42 | Reference | engineers, agents | 2 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/apps/stylist_app/ios/Runner/Assets.xcassets/LaunchImage.imageset/README.md` | 1 | 13 | Reference | engineers, agents | 0 / 0 / 0 | medium | unreviewed |
| `frontend/mobile/docs/architecture.md` | 1 | 47 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/architecture/coding-conventions.md` | 1 | 64 | Reference | engineers, agents | 1 / 1 / 1 | medium | unreviewed |
| `frontend/mobile/docs/architecture/decisions/0001-bloc-in-core.md` | 1 | 69 | Decisions | owner, engineers | 5 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/architecture/decisions/0002-design-system-go-router.md` | 1 | 55 | Decisions | owner, engineers | 2 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/authentication/auth-flow.md` | 2 | 132 | Reference | engineers, agents | 3 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/authentication/password-recovery.md` | 3 | 172 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/core/background-tasks.md` | 1 | 9 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/core/exceptions.md` | 1 | 89 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/core/interceptors.md` | 2 | 136 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/core/networking.md` | 3 | 137 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/core/result-state.md` | 1 | 58 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/core/session.md` | 5 | 267 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/core/storage.md` | 3 | 157 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/design-system/components/loading/button.md` | 1 | 31 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/design-system/components/loading/fullscreen.md` | 1 | 22 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/design-system/components/loading/inline.md` | 1 | 22 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/design-system/components/shimmer/text.md` | 1 | 26 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/design-system/index.md` | 2 | 95 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/design-system/states/authentication-required.md` | 1 | 21 | Reference | engineers, agents | 2 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/design-system/states/empty.md` | 1 | 24 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/design-system/states/network-error.md` | 1 | 31 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/design-system/states/offline.md` | 1 | 30 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/design-system/states/retry.md` | 1 | 21 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/design-system/states/session-expired.md` | 1 | 25 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/feature-index.md` | 5 | 279 | Reference | engineers, agents | 4 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/flows/app-launch.md` | 2 | 94 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/flows/guest-access.md` | 1 | 53 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/flows/onboarding.md` | 1 | 67 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/index.md` | 13 | 723 | Reference | engineers, agents | 3 / 2 / 0 | medium | unreviewed |
| `frontend/mobile/docs/navigation/guards.md` | 2 | 98 | Reference | engineers, agents | 2 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/navigation/routes.md` | 2 | 109 | Reference | engineers, agents | 1 / 1 / 1 | medium | unreviewed |
| `frontend/mobile/docs/realtime/reverb.md` | 2 | 156 | Reference | engineers, agents | 4 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/runtime/app-lifecycle.md` | 2 | 99 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/screens/authentication/create-new-password.md` | 1 | 44 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/screens/authentication/forgot-password.md` | 1 | 42 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/screens/authentication/password-reset-success.md` | 1 | 48 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/screens/authentication/recovery-otp.md` | 1 | 43 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/state-management/async-state.md` | 3 | 145 | Reference | engineers, agents | 2 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/state-management/conventions.md` | 5 | 285 | Reference | engineers, agents | 7 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/state-management/index.md` | 2 | 98 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/state-management/pagination.md` | 5 | 263 | Reference | engineers, agents | 4 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/docs/state-management/refresh.md` | 2 | 103 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/packages/core/CHANGELOG.md` | 1 | 11 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/packages/core/README.md` | 1 | 13 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/packages/design_system/CHANGELOG.md` | 1 | 11 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/packages/design_system/README.md` | 1 | 13 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/packages/feature_error_feedback/README.md` | 1 | 15 | Reference | engineers, agents | 0 / 0 / 0 | medium | unreviewed |
| `frontend/mobile/packages/localization/CHANGELOG.md` | 1 | 11 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `frontend/mobile/packages/localization/README.md` | 1 | 13 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `frontend/web/dashboard/.interface-design/system.md` | 1 | 81 | Reference | engineers, agents | 1 / 0 / 0 | medium | unreviewed |
| `frontend/web/dashboard/README.md` | 1 | 40 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `frontend/web/dashboard/src/README.md` | 1 | 47 | Reference | engineers, agents | 3 / 0 / 1 | medium | unreviewed |

## C6 product intent and research

| Logical document | Files | Lines | Class | Readers | Doc / router / other refs | Risk | Verdict |
|---|---|---|---|---|---|---|---|
| `backend/docs/01-vision-and-scope.md` | 3 | 172 | Intent | owner, product | 1 / 1 / 1 | low | unreviewed |
| `backend/docs/02-prd.md` | 8 | 460 | Intent | owner, product | 1 / 1 / 0 | low | unreviewed |
| `backend/docs/03-persona-journeys.md` | 2 | 101 | Intent | owner, product | 1 / 1 / 0 | low | unreviewed |
| `backend/docs/05-recommendation-prd.md` | 5 | 272 | Intent | owner, product | 1 / 1 / 0 | low | unreviewed |
| `backend/docs/07-user-flows.md` | 4 | 239 | Intent | owner, product | 1 / 1 / 0 | low | unreviewed |
| `backend/docs/08-edge-cases.md` | 3 | 159 | Intent | owner, product | 1 / 1 / 0 | low | unreviewed |
| `backend/docs/12-implementation-prd.md` | 4 | 233 | Intent | owner, product | 0 / 1 / 0 | low | unreviewed |
| `backend/docs/marketing/01-brand-dna.md` | 1 | 40 | Intent | owner, product | 1 / 1 / 0 | low | unreviewed |
| `backend/docs/marketing/02-platform-setup.md` | 1 | 69 | Intent | owner, product | 1 / 1 / 0 | low | unreviewed |
| `backend/docs/marketing/03-content-strategy.md` | 1 | 63 | Intent | owner, product | 1 / 1 / 0 | low | unreviewed |
| `backend/docs/marketing/04-launch-campaign.md` | 1 | 50 | Intent | owner, product | 1 / 1 / 0 | low | unreviewed |
| `backend/docs/marketing/05-metadata-and-seo.md` | 1 | 22 | Intent | owner, product | 1 / 1 / 0 | low | unreviewed |
| `backend/docs/marketing/06-teaser-content-plan.md` | 1 | 20 | Intent | owner, product | 1 / 1 / 0 | low | unreviewed |
| `backend/docs/marketing/07-conversion-assets.md` | 1 | 20 | Intent | owner, product | 1 / 1 / 0 | low | unreviewed |
| `backend/docs/marketing/08-visual-assets-inventory.md` | 1 | 28 | Intent | owner, product | 1 / 1 / 0 | low | unreviewed |
| `backend/modules/Website/docs/01-vision-and-scope.md` | 1 | 35 | Intent | owner, product | 1 / 1 / 0 | low | unreviewed |
| `backend/modules/Website/docs/02-prd.md` | 1 | 40 | Intent | owner, product | 1 / 1 / 0 | low | unreviewed |
| `backend/modules/Website/docs/03-persona-journeys.md` | 1 | 19 | Intent | owner, product | 1 / 1 / 0 | low | unreviewed |
| `backend/modules/Website/docs/07-user-flows.md` | 1 | 31 | Intent | owner, product | 1 / 1 / 0 | low | unreviewed |
| `backend/modules/Website/docs/08-edge-cases.md` | 1 | 25 | Intent | owner, product | 1 / 1 / 0 | low | unreviewed |
| `docs/competitor-analysis/index.md` | 1 | 24 | Research | owner, product | 17 / 1 / 0 | low | unreviewed |
| `docs/competitor-analysis/toptalla/01-executive-summary.md` | 1 | 47 | Research | owner, product | 3 / 1 / 0 | low | unreviewed |
| `docs/competitor-analysis/toptalla/02-company-and-evidence.md` | 1 | 29 | Research | owner, product | 5 / 1 / 0 | low | unreviewed |
| `docs/competitor-analysis/toptalla/03-platforms-and-availability.md` | 1 | 31 | Research | owner, product | 6 / 1 / 0 | low | unreviewed |
| `docs/competitor-analysis/toptalla/04-product-and-user-experience.md` | 1 | 38 | Research | owner, product | 7 / 1 / 0 | low | unreviewed |
| `docs/competitor-analysis/toptalla/05-market-and-geography.md` | 1 | 42 | Research | owner, product | 7 / 1 / 0 | low | unreviewed |
| `docs/competitor-analysis/toptalla/06-competitors-and-positioning.md` | 1 | 36 | Research | owner, product | 6 / 1 / 0 | low | unreviewed |
| `docs/competitor-analysis/toptalla/07-digital-presence-and-marketing.md` | 1 | 32 | Research | owner, product | 6 / 1 / 0 | low | unreviewed |
| `docs/competitor-analysis/toptalla/08-pricing-and-contracting.md` | 1 | 25 | Research | owner, product | 10 / 1 / 0 | low | unreviewed |
| `docs/competitor-analysis/toptalla/09-financial-feasibility.md` | 1 | 38 | Research | owner, product | 6 / 1 / 0 | low | unreviewed |
| `docs/competitor-analysis/toptalla/10-technical-architecture.md` | 1 | 27 | Research | owner, product | 6 / 1 / 0 | low | unreviewed |
| `docs/competitor-analysis/toptalla/11-privacy-compliance-and-risk.md` | 1 | 37 | Research | owner, product | 7 / 1 / 0 | low | unreviewed |
| `docs/competitor-analysis/toptalla/12-validation-plan-and-metrics.md` | 1 | 40 | Research | owner, product | 10 / 1 / 0 | low | unreviewed |
| `docs/competitor-analysis/toptalla/index.md` | 1 | 71 | Research | owner, product | 16 / 1 / 0 | low | unreviewed |
| `docs/product-research/dorak/dorak-study.md` | 1 | 278 | Research | owner, product | 0 / 0 / 0 | low | unreviewed |
| `docs/product-research/dorak/index.md` | 1 | 26 | Research | owner, product | 2 / 1 / 0 | low | unreviewed |
| `docs/product-research/dorak/proposals/provider-product-catalog-plan.md` | 1 | 234 | Intent | owner, product | 1 / 0 / 0 | low | unreviewed |
| `docs/product-research/dorak/proposals/provider-product-catalog.md` | 1 | 67 | Intent | owner, product | 2 / 0 / 0 | low | unreviewed |
| `docs/product-research/dorak/study-prompt.md` | 1 | 101 | Research | owner, product | 4 / 1 / 0 | low | unreviewed |
| `docs/product-research/index.md` | 1 | 22 | Research | owner, product | 3 / 1 / 0 | low | unreviewed |
| `frontend/mobile/docs/future-features/per-page/per-page.md` | 3 | 160 | Intent | owner, product | 0 / 1 / 0 | low | unreviewed |

## Deferred: `.claude/` files

Audited separately. Each row covers every tracked `.md` under that path (a row ending in `.claude/skills` covers only the files directly in it).

| Path | Files | Lines | Verdict |
|---|---|---|---|
| `.claude/skills` | 1 | 69 | deferred |
| `.claude/skills/codebase-cleanup` | 1 | 64 | deferred |
| `.claude/skills/frontend-design` | 1 | 71 | deferred |
| `.claude/skills/interface-design` | 1 | 320 | deferred |
| `.claude/skills/monorepo-task-executor` | 11 | 449 | deferred |
| `.claude/skills/security-audit` | 15 | 1778 | deferred |
| `.claude/skills/stitch-flutter-converter` | 11 | 358 | deferred |
| `.claude/skills/test-engineering` | 3 | 373 | deferred |
| `backend/.claude/skills` | 3 | 147 | deferred |
| `backend/.claude/skills/10StrictBackendArchitecture` | 1 | 48 | deferred |
| `backend/.claude/skills/12StrictEnums` | 3 | 170 | deferred |
| `backend/.claude/skills/api-response-standard` | 1 | 73 | deferred |
| `backend/.claude/skills/architecture` | 2 | 91 | deferred |
| `backend/.claude/skills/coding-standards` | 2 | 97 | deferred |
| `backend/.claude/skills/cqrs-pattern` | 4 | 219 | deferred |
| `backend/.claude/skills/crescent` | 3 | 136 | deferred |
| `backend/.claude/skills/database-conventions` | 1 | 58 | deferred |
| `backend/.claude/skills/feature-flags` | 1 | 15 | deferred |
| `backend/.claude/skills/grill-me` | 1 | 15 | deferred |
| `backend/.claude/skills/how-to-add-a-module` | 2 | 101 | deferred |
| `backend/.claude/skills/how-to-add-a-route` | 1 | 57 | deferred |
| `backend/.claude/skills/laravel-attributes` | 6 | 326 | deferred |
| `backend/.claude/skills/laravel-migrations-baseline` | 1 | 70 | deferred |
| `backend/.claude/skills/laravel-module-architecture-baseline` | 2 | 85 | deferred |
| `backend/.claude/skills/laravel-native-abstractions` | 55 | 2949 | deferred |
| `backend/.claude/skills/laravel-testing-baseline` | 2 | 96 | deferred |
| `backend/.claude/skills/logging-and-tracing` | 1 | 47 | deferred |
| `backend/.claude/skills/prototype` | 6 | 283 | deferred |
| `backend/.claude/skills/qa-plan` | 2 | 113 | deferred |
| `backend/.claude/skills/ralph-loop` | 3 | 137 | deferred |
| `backend/.claude/skills/research` | 1 | 63 | deferred |
| `backend/.claude/skills/testing` | 1 | 46 | deferred |
| `backend/.claude/skills/to-issues` | 2 | 102 | deferred |
| `backend/.claude/skills/to-prd` | 2 | 95 | deferred |
| `backend/.claude/skills/translation-conventions` | 1 | 70 | deferred |
| `frontend/web/dashboard/.claude/skills/dashboard-folder-decoupler` | 3 | 93 | deferred |
| `frontend/web/dashboard/.claude/skills/migrate-radix-to-base` | 10 | 2710 | deferred |
| `frontend/web/dashboard/.claude/skills/shadcn` | 13 | 3337 | deferred |
| `frontend/web/dashboard/.claude/skills/web-design-guidelines` | 1 | 39 | deferred |
