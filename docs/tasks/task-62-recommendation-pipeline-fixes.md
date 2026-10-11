# Task 62: Fix Recommendation Pipeline

**Phase:** Phase 10 — Client Intelligence · **Priority:** P2 · **Depends on:** Task 13, Task 15, Task 47 · **Audit source:** Feature-spec audit (BE-15, Recommendation PRD §2–§9, kanban); product-spec audit (Discovery REC-1); `backend/docs/features/recommendation-module/PRD.md`, `backend/docs/04_house-rules.md:148`

## Overview & Root Cause
The nightly recompute command (`recommend:recompute-vectors`) runs, but it is incomplete and has bugs:
- **Few signals.** It uses only favorites and completed bookings. Face profile, demographics and interaction logs (Task 47) are ignored.
- **Partial edge rebuild.** Only `favorite` edges are rebuilt. `history` edges come only from an observer, and `visited`, `face_matched` and `similar_client` edge types are defined but never written.
- **No cleanup.** Expired edges and orphan vectors are never removed (`expires_at` is never read).
- **`--force` is a no-op.**
- **`--client-id` bug.** The value is passed as the entity ID filter for branches and barbers, so a single-client run computes no entity embeddings.
- **Missing edge columns.** Edges lack the `computed_at` and `vector_version` columns required by REC-1.
- **Missing tests.** The tests listed in PRD §9 do not exist.

## Evidence
- `backend/modules/ClientRecommendation/Console/Commands/RecomputeClientVectorsCommand.php:23-24` — `--client-id` and `--force` options declared.
- `…/RecomputeClientVectorsCommand.php:43` — `$this->recomputeEntityEmbeddings($clientId)`.
- `…/RecomputeClientVectorsCommand.php:50-60` — `$singleEntityId` filters `BranchModel`/`BarberModel` by `id`.
- `…/RecomputeClientVectorsCommand.php:208-214, 234-243` — `gatherSignals` and `rebuildEdges` read only `ClientFavoriteModel` (plus bookings in signals).
- `backend/modules/ClientRecommendation/Enums/EdgeTypeEnum.php:9-13` — Favorite, Visited, History, FaceMatched, SimilarClient.
- `backend/modules/ClientRecommendation/Database/Migrations/2026_07_19_000001_create_recommendation_edges_table.php:20` — `expires_at`; no `computed_at` or `vector_version`.
- `backend/modules/ClientRecommendation/Providers/ClientRecommendationServiceProvider.php:38` — scheduled command.

## Full-Stack Scope
### Backend (API / DB / Policies)
- Fix `--client-id`: when it's set, recompute only that client's vector and skip entity embeddings (or recompute all of them). It must never filter entities by the client UUID.
- Implement `--force`: without it, skip clients whose vector `updated_at` is newer than their latest signal.
- Add signals: face analysis results (after Task 15), interaction logs (after Task 47), and history rows.
- `rebuildEdges`: also rebuild `history` edges, and `visited` edges from interaction logs. Decision required: whether `face_matched` and `similar_client` ship now or are deferred (PRD marks some as later).
- Cleanup step: delete edges with `expires_at < now()`, and vectors whose client no longer exists.
- Migration: add `computed_at` and `vector_version` to `recommendation_edges` and set them on write.
- The history-edge observer must handle a null `barber_id` (Task 13 owns that fix; this task adds a branch target edge).

### Dashboard (BFF / React)
- None. The pipeline is backend-only.

### Mobile (Flutter / Repositories)
- None. Results surface through existing Explore responses.

## Acceptance Criteria
- [ ] `php artisan recommend:recompute-vectors --client-id={uuid}` updates that client's vector and does not error. Entity embeddings are not filtered by the client UUID (unit test on the query).
- [ ] Without `--force`, a client with no new signals since the last run is skipped. With `--force`, it is recomputed (test asserts `updated_at`).
- [ ] After a run, edges with a past `expires_at` are gone, and vectors of deleted clients are gone.
- [ ] A completed booking produces a `history` edge after a recompute (Feature test).
- [ ] The tests from PRD §9 exist and pass: `RecomputeClientVectorsCommandTest`, `CompositeRankingTest` (with Task 46), `EmptyClientVectorFallbackTest` (with Task 46), and model unit tests.
- [ ] `php artisan test` passes; PHPStan max + Pint clean.

## Out of Scope
- Ranking order and α redistribution (Task 46). pgvector column type (Task 63).
- Interaction log writes (Task 47). Face job dispatch (Task 15).
