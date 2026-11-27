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

641 tracked Markdown files, not counting this audit's two files. Each appears once: as part of a logical document
below, or in a deferred `.claude/` row.

| Group | Files |
|---|---|
| Outside `.claude/` | 460 files = 266 logical documents (194 are part or group files) |
| `.claude/`, deferred | 181 files |

This corrects the earlier plan's "285 logical documents", which grouped parts by filename only.

| Cluster | Logical documents | Files | Lines |
|---|---|---|---|
| C0 pilot: push notifications | 2 | 2 | 524 |
| C1 agent guides and routers | 63 | 95 | 5,076 |
| C2 open work | 14 | 14 | 931 |
| C3 finished or running programmes | 52 | 58 | 3,113 |
| C4 backend and shared reference | 32 | 112 | 6,360 |
| C5 mobile and dashboard | 62 | 114 | 5,357 |
| C6 product intent and research | 41 | 65 | 3,503 |

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
| F7 | Push rules conflict (policy decision DA-1). | root `AGENTS.md` and `CLAUDE.md`; `docs/backlog/index.md:183`; `docs/waves/index.md:64` |
| F8 | The session board's registry looks out of date: it lists unowned working-tree edits, but the tree was clean when this audit began. Of the sessions on this machine, only one other is live and it isn't in the registry. Cloud sessions and other computers couldn't be listed. | `docs/sessions/index.md`, `git status`, session list |
| F9 | `docs/index.md` says every maintained document is listed, apart from stated exclusions. Some outside those exclusions have no router link, for example `backend/docs/17-sms-delivery.md` and `backend/docs/api-response-standard.md`. They may be reachable through a sub-index. | router count of 0 in the tables |

## Not routed yet

This audit's two files aren't listed in `docs/index.md` or on the session board, because existing documents are
frozen during phases 0 and 1.

## C0 pilot: push notifications

| Logical document | Files | Lines | Class | Readers | Doc / router / other refs | Risk | Verdict |
|---|---|---|---|---|---|---|---|
| `docs/architecture/push-notifications.md` | 1 | 197 | Reference | engineers, agents | 8 / 1 / 0 | high | fix (F1) |
| `docs/deployment/dev-environment-status.md` | 1 | 327 | Operations | operators, agents | 12 / 1 / 0 | high | unreviewed |

## C1 agent guides and routers

| Logical document | Files | Lines | Class | Readers | Doc / router / other refs | Risk | Verdict |
|---|---|---|---|---|---|---|---|
| `AGENTS.md` | 1 | 108 | Rules | agents, engineers | 4 / 1 / 4 | high | merge (F4) |
| `CLAUDE.md` | 2 | 144 | Rules | agents, engineers | 1 / 1 / 5 | high | merge (F4) |
| `README.md` (also in C0) | 3 | 201 | Router | agents, engineers | 9 / 1 / 3 | high | fix (F1) |
| `backend/AGENTS.md` | 2 | 109 | Rules | agents, engineers | 5 / 2 / 10 | high | unreviewed |
| `backend/CLAUDE.md` | 1 | 66 | Rules | agents, engineers | 3 / 1 / 1 | high | unreviewed |
| `backend/process/process.md` | 4 | 221 | Rules | agents, engineers | 0 / 1 / 0 | high | unreviewed |
| `docs/graph/repo-index.md` | 1 | 29 | Router | agents, engineers | 0 / 1 / 0 | high | unreviewed |
| `docs/index.md` | 6 | 498 | Router | agents, engineers | 34 / 1 / 0 | high | unreviewed |
| `frontend/mobile/AGENTS.md` | 2 | 94 | Rules | agents, engineers | 24 / 2 / 1 | high | unreviewed |
| `frontend/mobile/CLAUDE.md` | 2 | 106 | Rules | agents, engineers | 15 / 1 / 1 | high | unreviewed |
| `frontend/mobile/apps/business_app/AGENTS.md` | 2 | 138 | Rules | agents, engineers | 5 / 1 / 0 | high | unreviewed |
| `frontend/mobile/apps/business_app/CLAUDE.md` | 2 | 97 | Rules | agents, engineers | 4 / 1 / 0 | high | unreviewed |
| `frontend/mobile/apps/client_app/AGENTS.md` | 2 | 99 | Rules | agents, engineers | 8 / 1 / 0 | high | unreviewed |
| `frontend/mobile/apps/client_app/CLAUDE.md` | 2 | 109 | Rules | agents, engineers | 5 / 1 / 0 | high | unreviewed |
| `frontend/mobile/apps/client_app/references/bootstrap-and-flows.md` | 2 | 133 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/apps/client_app/references/decisions.md` | 1 | 69 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/apps/client_app/references/feature-status.md` | 1 | 57 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/apps/client_app/references/tests.md` | 1 | 52 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/apps/client_app/references/verification.md` | 1 | 26 | Rules | agents, engineers | 0 / 0 / 0 | high | unreviewed |
| `frontend/mobile/apps/stylist_app/AGENTS.md` | 2 | 145 | Rules | agents, engineers | 6 / 1 / 0 | high | unreviewed |
| `frontend/mobile/apps/stylist_app/CLAUDE.md` | 2 | 99 | Rules | agents, engineers | 4 / 1 / 0 | high | unreviewed |
| `frontend/mobile/packages/core/AGENTS.md` | 3 | 131 | Rules | agents, engineers | 10 / 1 / 0 | high | unreviewed |
| `frontend/mobile/packages/core/CLAUDE.md` | 2 | 110 | Rules | agents, engineers | 6 / 1 / 0 | high | unreviewed |
| `frontend/mobile/packages/core/references/gotchas.md` | 1 | 39 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/packages/core/references/networking.md` | 1 | 53 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/packages/core/references/repositories.md` | 1 | 64 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/packages/core/references/session.md` | 1 | 68 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/packages/core/references/state-management.md` | 1 | 41 | Rules | agents, engineers | 0 / 0 / 0 | high | unreviewed |
| `frontend/mobile/packages/core/references/storage.md` | 1 | 47 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/packages/core/references/tests.md` | 1 | 37 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/packages/core/references/verification.md` | 1 | 22 | Rules | agents, engineers | 0 / 0 / 0 | high | unreviewed |
| `frontend/mobile/packages/design_system/AGENTS.md` | 2 | 100 | Rules | agents, engineers | 7 / 1 / 1 | high | unreviewed |
| `frontend/mobile/packages/design_system/CLAUDE.md` | 2 | 106 | Rules | agents, engineers | 4 / 1 / 0 | high | unreviewed |
| `frontend/mobile/packages/design_system/references/gotchas-and-missing.md` | 1 | 38 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/packages/design_system/references/tokens.md` | 1 | 49 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/packages/design_system/references/widgets.md` | 1 | 58 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/packages/feature_error_feedback/AGENTS.md` | 1 | 34 | Rules | agents, engineers | 4 / 0 / 0 | high | unreviewed |
| `frontend/mobile/packages/feature_error_feedback/CLAUDE.md` | 1 | 29 | Rules | agents, engineers | 3 / 0 / 0 | high | unreviewed |
| `frontend/mobile/packages/localization/AGENTS.md` | 2 | 120 | Rules | agents, engineers | 5 / 1 / 1 | high | unreviewed |
| `frontend/mobile/packages/localization/CLAUDE.md` | 1 | 70 | Rules | agents, engineers | 4 / 1 / 0 | high | unreviewed |
| `frontend/mobile/packages/localization/references/keys.md` | 3 | 147 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/references/codegen-policy.md` | 1 | 34 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/references/commands.md` | 1 | 32 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/references/dependency-layering.md` | 1 | 44 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/references/file-taxonomy.md` | 1 | 31 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/references/root/backend-contract.md` | 1 | 57 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/references/root/commands.md` | 1 | 35 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/references/root/core-architecture.md` | 3 | 190 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/references/root/decisions.md` | 1 | 53 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/references/root/design-system.md` | 1 | 35 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/references/root/feature-inventory.md` | 1 | 70 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/references/root/file-taxonomy.md` | 1 | 44 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/references/root/known-limitations.md` | 1 | 18 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/references/root/localization.md` | 1 | 30 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/references/root/non-negotiable-rules.md` | 1 | 47 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/references/root/per-unit-docs.md` | 1 | 44 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/references/root/repository-shape.md` | 1 | 45 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/references/root/testing-conventions.md` | 2 | 92 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/references/root/where-new-code-goes.md` | 1 | 28 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/references/state-and-navigation.md` | 1 | 29 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/mobile/references/type-safety.md` | 1 | 28 | Rules | agents, engineers | 1 / 0 / 0 | high | unreviewed |
| `frontend/web/dashboard/AGENTS.md` | 1 | 118 | Rules | agents, engineers | 4 / 2 / 1 | high | unreviewed |
| `frontend/web/dashboard/CLAUDE.md` | 1 | 9 | Rules | agents, engineers | 2 / 1 / 1 | high | unreviewed |

## C2 open work

| Logical document | Files | Lines | Class | Readers | Doc / router / other refs | Risk | Verdict |
|---|---|---|---|---|---|---|---|
| `backend/docs/14-execution-status.md` | 1 | 28 | Open work | owner, agents | 1 / 1 / 0 | high | fix (F2) |
| `docs/backlog/index.md` (push rows in C0) | 1 | 191 | Open work | owner, agents | 31 / 2 / 3 | high | unreviewed |
| `docs/sessions/handover-push-phase-2.md` (also in C0) | 1 | 132 | Temporary | history; agents if linked | 3 / 1 / 0 | medium | unreviewed |
| `docs/sessions/index.md` | 1 | 54 | Open work | owner, agents | 6 / 1 / 0 | high | unreviewed |
| `docs/waves/index.md` | 1 | 88 | Open work | owner, agents | 12 / 1 / 0 | high | unreviewed |
| `docs/waves/runbook.md` | 1 | 114 | Operations | operators, agents | 9 / 1 / 2 | high | unreviewed |
| `docs/waves/wave-0.md` | 1 | 42 | Open work | owner, agents | 1 / 1 / 0 | high | unreviewed |
| `docs/waves/wave-1-decisions.md` | 1 | 47 | Decisions | owner, engineers | 3 / 1 / 0 | medium | unreviewed |
| `docs/waves/wave-1.md` | 1 | 47 | Open work | owner, agents | 2 / 1 / 0 | high | unreviewed |
| `docs/waves/wave-2.md` | 1 | 39 | Open work | owner, agents | 1 / 1 / 0 | high | unreviewed |
| `docs/waves/wave-3.md` | 1 | 41 | Open work | owner, agents | 1 / 1 / 0 | high | unreviewed |
| `docs/waves/wave-4.md` | 1 | 37 | Open work | owner, agents | 1 / 1 / 0 | high | unreviewed |
| `docs/waves/wave-5.md` | 1 | 37 | Open work | owner, agents | 1 / 1 / 0 | high | unreviewed |
| `docs/waves/wave-6.md` | 1 | 34 | Open work | owner, agents | 1 / 1 / 0 | high | unreviewed |

## C3 finished or running programmes

| Logical document | Files | Lines | Class | Readers | Doc / router / other refs | Risk | Verdict |
|---|---|---|---|---|---|---|---|
| `docs/booking-concurrency/01-lock-order-and-deadlocks.md` | 1 | 77 | Temporary | history; agents if linked | 6 / 1 / 0 | medium | unreviewed |
| `docs/booking-concurrency/02-overlap-guards.md` | 1 | 51 | Temporary | history; agents if linked | 4 / 1 / 0 | medium | unreviewed |
| `docs/booking-concurrency/03-idempotency-and-uniqueness.md` | 1 | 96 | Temporary | history; agents if linked | 7 / 1 / 0 | medium | unreviewed |
| `docs/booking-concurrency/04-hashing-and-tokens.md` | 1 | 42 | Temporary | history; agents if linked | 5 / 1 / 0 | medium | unreviewed |
| `docs/booking-concurrency/05-search-and-availability.md` | 1 | 59 | Temporary | history; agents if linked | 2 / 1 / 0 | medium | unreviewed |
| `docs/booking-concurrency/06-client-sync-and-ux.md` | 1 | 60 | Temporary | history; agents if linked | 3 / 1 / 0 | medium | unreviewed |
| `docs/booking-concurrency/07-test-coverage.md` | 1 | 59 | Temporary | history; agents if linked | 5 / 1 / 0 | medium | unreviewed |
| `docs/booking-concurrency/08-remediation-plan.md` | 1 | 54 | Temporary | history; agents if linked | 6 / 1 / 0 | medium | unreviewed |
| `docs/booking-concurrency/09-write-path-audit.md` | 1 | 52 | Temporary | history; agents if linked | 6 / 1 / 0 | medium | unreviewed |
| `docs/booking-concurrency/10-fix-order.md` | 1 | 64 | Temporary | history; agents if linked | 7 / 1 / 0 | medium | unreviewed |
| `docs/booking-concurrency/index.md` | 1 | 90 | Temporary | history; agents if linked | 12 / 1 / 0 | medium | unreviewed |
| `docs/feature-modules-plan.md` | 1 | 460 | Temporary | history; agents if linked | 4 / 1 / 0 | medium | unreviewed |
| `docs/frontend-arch-review/01-executive-summary.md` | 1 | 66 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/frontend-arch-review/02-components-and-hooks.md` | 1 | 59 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/frontend-arch-review/03-state-management-and-react.md` | 1 | 59 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/frontend-arch-review/04-data-flow-and-api.md` | 1 | 34 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/frontend-arch-review/05-files-and-code-organization.md` | 1 | 36 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/frontend-arch-review/06-types-and-validation.md` | 1 | 49 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/frontend-arch-review/07-dependencies-and-module-boundaries.md` | 1 | 17 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/frontend-arch-review/08-maintainability-and-technical-debt.md` | 1 | 65 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/frontend-arch-review/09-prioritized-action-plan.md` | 1 | 55 | Temporary | history; agents if linked | 2 / 1 / 0 | medium | unreviewed |
| `docs/frontend-arch-review/10-performance-and-bundle.md` | 1 | 46 | Temporary | history; agents if linked | 2 / 1 / 0 | medium | unreviewed |
| `docs/frontend-arch-review/11-resolution-status.md` | 1 | 31 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/frontend-arch-review/index.md` | 1 | 17 | Temporary | history; agents if linked | 0 / 1 / 0 | medium | unreviewed |
| `docs/mobile-audit-g10-g11/01-dto-is-active-bug.md` | 1 | 33 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/mobile-audit-g10-g11/02-token-scope-mismatch.md` | 1 | 35 | Temporary | history; agents if linked | 3 / 1 / 0 | medium | unreviewed |
| `docs/mobile-audit-g10-g11/03-inbox-scope-definition.md` | 1 | 32 | Temporary | history; agents if linked | 3 / 1 / 0 | medium | unreviewed |
| `docs/mobile-audit-g10-g11/04-navigation-shell-gap.md` | 1 | 28 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/mobile-audit-g10-g11/05-missing-backend-routes.md` | 1 | 31 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/mobile-audit-g10-g11/06-mvp-scope-decisions.md` | 1 | 44 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/mobile-audit-g10-g11/index.md` | 1 | 57 | Temporary | history; agents if linked | 7 / 1 / 0 | medium | unreviewed |
| `docs/planning/dashboard-refactor-batch-3.md` | 1 | 161 | Temporary | history; agents if linked | 0 / 1 / 0 | medium | unreviewed |
| `docs/planning/existing-frontend-audit.md` | 4 | 252 | Temporary | history; agents if linked | 0 / 1 / 0 | high | fix (F5) |
| `docs/planning/product-audit.md` | 3 | 119 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/planning/remediation-plan.md` | 2 | 99 | Temporary | history; agents if linked | 0 / 1 / 0 | medium | unreviewed |
| `docs/readiness/index.md` | 1 | 90 | Temporary | history; agents if linked | 0 / 1 / 0 | medium | unreviewed |
| `docs/readiness/t01-mobile-release-config.md` | 1 | 37 | Temporary | history; agents if linked | 1 / 1 / 1 | medium | unreviewed |
| `docs/readiness/t02-backend-legal-pages.md` | 1 | 30 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/readiness/t03-dashboard-legal-content.md` | 1 | 27 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/readiness/t04-backend-feedback.md` | 1 | 31 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/readiness/t05-dashboard-support-inbox.md` | 1 | 25 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/readiness/t06-barber-account-deletion.md` | 1 | 27 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/readiness/t07-branch-account-deletion.md` | 1 | 17 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/readiness/t08-mobile-shared-layer.md` | 1 | 26 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/readiness/t09-mobile-app-integration.md` | 1 | 26 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/readiness/t10-public-barber-resource.md` | 1 | 28 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/readiness/t11-privacy-checks.md` | 1 | 27 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/readiness/t12-dashboard-web-hygiene.md` | 1 | 24 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/readiness/t13-docs-and-gates.md` | 1 | 20 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/readiness/t14-owner-mobile-backend-api.md` | 1 | 34 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/readiness/t15-owner-mobile-core-layer.md` | 1 | 25 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |
| `docs/readiness/t16-business-app-owner-experience.md` | 1 | 30 | Temporary | history; agents if linked | 1 / 1 / 0 | medium | unreviewed |

## C4 backend and shared reference

| Logical document | Files | Lines | Class | Readers | Doc / router / other refs | Risk | Verdict |
|---|---|---|---|---|---|---|---|
| `backend/README.md` | 3 | 172 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `backend/docs/04-house-rules.md` | 3 | 184 | Decisions | owner, engineers | 1 / 1 / 1 | medium | unreviewed |
| `backend/docs/05-domain-glossary.md` | 2 | 98 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `backend/docs/06-entity-model-abstract.md` | 13 | 661 | Reference | engineers, agents | 1 / 1 / 0 | high | fix (F3) |
| `backend/docs/09-c4-context.md` | 2 | 88 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `backend/docs/10-c4-containers.md` | 3 | 152 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `backend/docs/11-backend-architecture.md` | 20 | 1012 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `backend/docs/13-technical-concepts.md` | 21 | 1138 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `backend/docs/16-deployment-operations.md` | 11 | 654 | Operations | operators, agents | 0 / 1 / 4 | high | unreviewed |
| `backend/docs/17-sms-delivery.md` | 1 | 51 | Reference | engineers, agents | 0 / 0 / 0 | medium | unreviewed |
| `backend/docs/README.md` | 3 | 145 | Reference | engineers, agents | 1 / 2 / 0 | medium | unreviewed |
| `backend/docs/api-response-standard.md` | 1 | 28 | Reference | engineers, agents | 0 / 0 / 0 | medium | unreviewed |
| `backend/docs/feature-index.md` | 8 | 651 | Reference | engineers, agents | 3 / 1 / 0 | medium | unreviewed |
| `backend/modules/Website/docs/04-house-rules.md` | 1 | 27 | Decisions | owner, engineers | 1 / 1 / 0 | medium | unreviewed |
| `backend/modules/Website/docs/05-domain-glossary.md` | 1 | 16 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `backend/modules/Website/docs/06-content-and-ui-model-abstract.md` | 1 | 43 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `backend/modules/Website/docs/09-c4-context.md` | 1 | 33 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `backend/modules/Website/docs/10-c4-containers.md` | 1 | 44 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `backend/modules/Website/docs/11-frontend-architecture.md` | 1 | 36 | Reference | engineers, agents | 1 / 1 / 0 | medium | unreviewed |
| `backend/modules/Website/docs/README.md` | 1 | 51 | Reference | engineers, agents | 0 / 1 / 0 | medium | unreviewed |
| `docs/adr/0001-brand-owner-as-client.md` | 1 | 64 | Decisions | owner, engineers | 1 / 1 / 0 | medium | unreviewed |
| `docs/adr/0002-mvp-scope-deferrals.md` | 1 | 45 | Decisions | owner, engineers | 3 / 1 / 1 | medium | unreviewed |
| `docs/adr/0003-new-dashboard-foundation.md` | 1 | 41 | Decisions | owner, engineers | 4 / 1 / 0 | medium | unreviewed |
| `docs/adr/0004-archive-legacy-dashboard.md` | 1 | 47 | Decisions | owner, engineers | 4 / 1 / 0 | medium | unreviewed |
| `docs/architecture/architecture.md` | 1 | 64 | Reference | engineers, agents | 4 / 1 / 0 | medium | unreviewed |
| `docs/architecture/frontend-architecture.md` | 1 | 55 | Reference | engineers, agents | 1 / 2 / 0 | medium | unreviewed |
| `docs/architecture/localization-of-machine-keys.md` | 1 | 59 | Reference | engineers, agents | 7 / 1 / 1 | medium | unreviewed |
| `docs/architecture/testing-strategy.md` | 1 | 190 | Reference | engineers, agents | 7 / 1 / 2 | medium | unreviewed |
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
| `frontend/mobile/docs/realtime/reverb.md` | 2 | 153 | Reference | engineers, agents | 4 / 1 / 0 | medium | unreviewed |
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
