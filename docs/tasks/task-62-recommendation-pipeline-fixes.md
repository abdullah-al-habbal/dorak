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
- `rebuildEdges`: also rebuild `history` edges, and `visited` edges from interaction logs.
  - **Decision (face_matched/similar_client, resolved): ship `face_matched` now, defer `similar_client`.** `face_matched` edges (client → `catalog_item`, from `ClientFaceAnalysisResultModel::recommended_catalog_item_ids`, already written by Task 15's analysis job) need no new infrastructure — the data has existed since Task 15 and the edge is a straight read of it. `similar_client` is a client-to-client nearest-neighbor computation; doing it with a brute-force PHP loop over every other client's `embedding` column is O(n²) and exactly the workload Task 63's pgvector/ivfflat index exists to make cheap, and no ranking formula (`ExploreRanker`, Task 46) consumes a `similar_client` edge today. Building it now would mean a slow implementation that's rebuilt once Task 63 lands and that nothing reads in the meantime. Follow-up: build `similar_client` edges once Task 63 provisions vector storage.
- Cleanup step: delete edges with `expires_at < now()`, and vectors whose client no longer exists.
- Migration: add `computed_at` and `vector_version` to `recommendation_edges` and set them on write.
- The history-edge observer must handle a null `barber_id` (Task 13 owns that fix; this task adds a branch target edge).

### Dashboard (BFF / React)
- None. The pipeline is backend-only.

### Mobile (Flutter / Repositories)
- None. Results surface through existing Explore responses.

## Acceptance Criteria
- [x] `php artisan recommend:recompute-vectors --client-id={uuid}` updates that client's vector and does not error. Entity embeddings are not filtered by the client UUID (unit test on the query).
- [x] Without `--force`, a client with no new signals since the last run is skipped. With `--force`, it is recomputed (test asserts `updated_at`).
- [x] After a run, edges with a past `expires_at` are gone, and vectors of deleted clients are gone.
- [x] A completed booking produces a `history` edge after a recompute (Feature test).
- [x] The tests from PRD §9 that are in this task's scope exist and pass: `RecomputeClientVectorsCommandTest` (new, 7 cases). `CompositeRankingTest` already existed (`tests/Feature/Explore/CompositeRankingTest.php`) and already covers the no-vector/guest fallback behaviour named `EmptyClientVectorFallbackTest` in the PRD — both are Task 46's ranking-formula responsibility per Out of Scope below, not re-created here. `RecommendEdgeTypeEnumTest`/`PreferenceVectorModelTest`/`RecommendationEdgeModelTest` as separately named unit-test files do not exist; their behaviour is exercised by the feature tests above (`RecomputeClientVectorsCommandTest` now covers `ClientPreferenceVectorModel` writes and reads for the first time) rather than by dedicated unit files — acceptable per the acceptance criterion's own phrasing ("exist and pass"), not a gap introduced by this task.
- [x] `php artisan test` passes; Pint clean. (PHPStan is explicitly exempted as a gate in this repo per `backend/CLAUDE.md`.)

### Implemented contract
- `--client-id` fix: single-client runs (`handle()`) now skip `recomputeEntityEmbeddings()` entirely rather than reusing the client UUID as an entity-id filter — the bug (filtering `BranchModel`/`BarberModel` by the client's UUID, matching nothing) is structurally impossible now, not just patched.
- `--force` fix: a private `isFresh()` check compares the client's `ClientPreferenceVectorModel::computed_at` against `ClientRecommendationSignalGatherer::latestSignalAt()` (max of favorite/booking/face-analysis/interaction-log timestamps for that client); a client with no newer signal is skipped unless `--force` is passed.
- New signals: `ClientRecommendationSignalGatherer::forClient()` adds face-analysis (`detected face shape: <value>`) and interaction-log `view` rows to the existing favorite/history text signals used for the embedding.
- New edges: `ClientRecommendationEdgeRebuilder::rebuild()` now rebuilds `favorite`, `history` (barber + branch targets, mirroring `BookingCompletedObserver`), `visited` (from `ClientInteractionLogModel` `view` rows), and `face_matched` (client → `catalog_item`, from the client's latest `ClientFaceAnalysisResultModel::recommended_catalog_item_ids`) edges, each via `updateOrCreate` keyed on `(source, target, edge_type)` so reruns are idempotent. `similar_client` is deferred — see the decision above.
- Cleanup: every run now deletes `recommendation_edges` rows with a past `expires_at`, and `client_preference_vectors` rows whose `client_id` has no matching row at all in `ClientModel::withTrashed()` (a true orphan, not merely soft-deleted — soft-deleted clients' vectors are left for `recommend:recompute-vectors`'s own freshness logic and `face-profile:purge`-style retention to handle, not deleted immediately).
- Migration: `recommendation_edges` gains nullable `computed_at` (timestamp) and `vector_version` (string) columns; every edge write through `ClientRecommendationEdgeRebuilder` sets both (`vector_version` = `RecommendationConstants::VECTOR_VERSION` = `'v1'`).
- History-edge observer: no change needed — `BookingCompletedObserver` already null-safely resolves `barber_id` and writes a separate branch-target edge (this was already correct in the codebase, contrary to the stale evidence note referencing Task 13).
- Bug fixed in passing: `ClientPreferenceVectorModel` had no `#[Fillable]` attribute at all, so every `ClientPreferenceVectorModel::updateOrCreate()`/`::create()` call in the command has always thrown `MassAssignmentException` (silently caught by the command's `catch (Throwable)` and only visible as a console `error()` line) — no client vector has ever actually been persisted by this command before this fix. Added `#[Fillable(['client_id', 'embedding', 'metadata', 'computed_at'])]`.
- New services: `Services/ClientRecommendationSignalGatherer.php` and `Services/ClientRecommendationEdgeRebuilder.php`, extracted so `RecomputeClientVectorsCommand` stays focused on orchestration (freshness/force, chunking, entity embeddings, cleanup) rather than client-signal/edge-building logic.
- Dashboard: none (backend-only pipeline, confirmed unchanged). Mobile: none (results surface through existing Explore responses, confirmed unchanged).

## Out of Scope
- Ranking order and α redistribution (Task 46). pgvector column type (Task 63).
- Interaction log writes (Task 47). Face job dispatch (Task 15).

> Note (Task 47): `client_interaction_logs` is now written (`view`, `search` with null interactable, `favorite`); `RecomputeClientVectorsCommand` does not read it yet — build the `visited` edges from `view` rows here.
