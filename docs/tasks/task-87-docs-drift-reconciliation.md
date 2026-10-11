# Task 87: Reconcile Spec and Status Docs with Code

**Phase:** Phase 15 — Documentation · **Priority:** P3 · **Depends on:** run last. Update each doc as the corresponding task lands, and do a final sweep after Task 86. · **Audit source:** Feature-spec audit, DocDrift rows; consolidated report section 4

## Overview & Root Cause
Status and spec documents claim completeness or contracts that the code does not match. Contributors and agents read these docs first (`index.md` → `backend/AGENTS.md`), so the drift causes wrong assumptions, such as believing pgvector is active or that recommendations are complete. Each doc must state the actual state of the code, or link to `docs/todowork.md` for open work.

## Evidence (each item = file to correct)
- `backend/docs/14_execution-status.md:116-118` — "Remaining Work: None — full platform implementation complete." The line 3 banner already admits it is inaccurate. Replace it with a pointer to `docs/todowork.md`.
- `backend/docs/feature-index.md:323-327` — BE-15/16/17/18/19 are marked "✅ Complete". Each is partial per the audit (recommendation pipeline Task 62, pgvector Task 63, ranking Task 46, namespacing Task 67, profile Tasks 32/33).
- `backend/docs/feature-index.md:19` and `backend/docs/features/BE-01-core-infrastructure.md:11` — the guard list has 5 guards. `backend/modules/Core/Config/auth.php` also defines `branch_api` and `admin_api`.
- `backend/docs/feature-index.md:72` — says the review subject is derived "from chair.branch or barber". The code has no barber fallback (Task 39).
- `backend/docs/features/recommendation-module/kanban.md:16-52` — I-1…I-7 are marked 🟢. The code lacks α redistribution, global ranking order, a correct recompute, and the PRD §9 tests (Tasks 46, 62).
- `backend/docs/features/BE-16-ai-sdk-postgresql-setup.md:7` — says "`DB_CONNECTION=pgsql` active". `backend/.env:19` and `backend/.env.example:19` set `mysql`, and `backend/phpunit.xml:28` uses `sqlite` (Task 63).
- `backend/docs/12_implementation-prd.md:32-38` — Chair, OfferedService, Currency, Activation and Ban are marked "B missing", but all have REST routes (`routes.tsv`).
- `backend/docs/actionable-plan.md:27-28` and `docs/actionable-plan.md:36` — call `AnalyzeFacePhotoJob` an "MVP stub" and the A/B framework a gap. An AI agent pipeline exists (`backend/modules/ClientFaceProfile/Services/FaceAnalysisService.php`); it is simply never dispatched (Task 15). Pennant A/B exists (`backend/modules/ClientRecommendation/Features/ExploreRankingFeature.php`).
- `backend/docs/features/BE-03-explore-api.md:125-126` — `radius` default 50 and `universe` optional. `backend/modules/Explore/Http/Requests/Shared/ExploreBranchesRequest.php:19-20` makes both `required`, and `backend/docs/features/BE-17-explore-enhancements.md:29-30` agrees with the code.
- `backend/docs/02_prd.md:149` — non-guessable identifiers. The service-catalog tables use `$table->id()` (bigint), and BE-17 documents integer `catalog_item_ids` (lines 32, 104). Record the Task 14 decision.
- `backend/docs/features/BE-04-floor-plan-booking.md:17-25` — documents `GET /branches/{branch}/floor-plan` with no query params. `backend/modules/Branch/Http/Requests/Shared/GetFloorPlanRequest.php:16-18` requires `date`, `time_slot` and `duration`.
- `backend/docs/features/BE-18-context-driven-namespacing.md:7` — "moved into `{Client|Barber|Business|Shared}/` subdirs across all 17 modules". Dashboard, ClientInteraction, ClientHistory, ClientFaceProfile and Core do not conform (Task 67).
- `backend/docs/feature-index.md` "Frontend Consumption" section — describes Flutter screens that no longer match the rebuilt apps. Update it after Tasks 78–85.

## Full-Stack Scope
### Backend (API / DB / Policies)
- None — documentation only. Each code task updates its own spec on merge; this task covers the remaining sweep and the status docs.

### Dashboard (BFF / React)
- Update `frontend/dashboard/EXECUTION_PLAN.md` and `docs/DASHBOARD_IMPLEMENTATION_PLAN.md` status markers to match Tasks 68–77.

### Mobile (Flutter / Repositories)
- Update `frontend/mobile/docs/index.md` feature status to match Tasks 78–86.

## Acceptance Criteria
- [ ] Every item listed under Evidence is corrected or explicitly marked historical, with a link to the relevant task in `docs/todowork.md`.
- [ ] `grep -rn "Remaining Work" backend/docs` no longer returns "None".
- [ ] No doc under `backend/docs/features/` claims `DB_CONNECTION=pgsql` unless `.env.example` matches.
- [ ] Each "✅ Complete" row in `backend/docs/feature-index.md` maps to a task whose checkbox in `docs/todowork.md` is ticked.
- [ ] Docs-only change: the backend test suite and `melos run analyze` are unaffected.

## Out of Scope
- Code changes (Tasks 01–86).
