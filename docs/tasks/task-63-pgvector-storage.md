# Task 63: Provision pgvector Storage for Preference Vectors

**Phase:** Phase 10 — Client Intelligence · **Priority:** P2 · **Depends on:** Task 62 · **Audit source:** Feature-spec audit (BE-16, Recommendation PRD §8); `backend/docs/features/BE-16-ai-sdk-postgresql-setup.md`, `backend/docs/features/recommendation-module/PRD.md` §8

## Overview & Root Cause
The recommendation PRD requires `vector(1536)` columns with an ivfflat/HNSW index for similarity search. BE-16 claims PostgreSQL + pgvector is active, but:
- `.env.example` uses MySQL and PHPUnit uses SQLite.
- `client_preference_vectors.embedding` is plain JSON with no conversion attempt.
- Only `entity_embeddings` tries an `ALTER … TYPE vector(1536)`, falling back silently to JSON when pgvector is missing.

So similarity runs in PHP over JSON arrays, and the documented infrastructure state is wrong.

## Evidence
- `backend/.env.example:19` — `DB_CONNECTION=mysql`.
- `backend/phpunit.xml:28` — `DB_CONNECTION` = `sqlite`.
- `backend/modules/ClientRecommendation/Database/Migrations/2026_07_19_000002_create_client_preference_vectors_table.php:16` — `json('embedding')`.
- `backend/modules/ClientRecommendation/Database/Migrations/2026_07_19_000003_create_entity_embeddings_table.php:27-29` — conditional `vector(1536)` alter with a "pgvector not available — json column suffices" fallback.
- `backend/modules/ClientRecommendation/Eloquent/Casts/EmbeddingCast.php` — cast layer for embeddings.

## Full-Stack Scope
### Backend (API / DB / Policies)
- **Decision (target production database, resolved): (b) — stay on MySQL; formally drop the
  pgvector requirement.** Evidence is unanimous and pre-existing, not a new choice being made
  here: `.github/workflows/backend-ci.yml` runs only a MySQL service and its own comment says
  "The suite has only ever run on MySQL and the 57 migrations were written for it"; `backend/README.md`
  lists MySQL 8.0 as "primary database"; `.env.example` defaults to `DB_CONNECTION=mysql`; every
  other migration in the repo is MySQL-shaped (UUID primary keys via `HasUuids`, no Postgres-only
  types). BE-16's "PostgreSQL + pgvector — active" claim was aspirational and was never actually
  built — the only artifact of it was the dead `ALTER TABLE ... TYPE vector(1536)` statement on
  `entity_embeddings`, wrapped in a `try/catch` that silently no-ops on every MySQL run (the only
  kind of run that has ever happened). Moving the whole project's production database engine is a
  real infrastructure migration with hosting/ops consequences; nothing in this task's evidence
  makes that trade-off for a product/infra owner, so the autonomous default is the non-destructive,
  evidence-matching option: formalize what is already running, not switch engines.
  - Removed the dead `ALTER ... TYPE vector(1536)` branch (and its silent `catch`) from
    `2026_07_19_000003_create_entity_embeddings_table.php`; both embedding tables are plain
    `json` columns on MySQL, documented in-migration.
  - Updated Recommendation PRD §8 (`backend/docs/features/recommendation-module/PRD.md`) to
    record the decision and strike the pgvector migration steps as historical/never-implemented.
  - `backend/docs/features/BE-16-ai-sdk-postgresql-setup.md` itself is corrected under Task 87
    (documentation sweep), per this task's Acceptance Criteria and Out of Scope.
  - No pgsql CI job is added (option (a) is not taken); `EmbeddingCast` is unchanged — it already
    round-trips a JSON array, which is the permanent storage shape under this decision.

### Dashboard (BFF / React)
- None — infrastructure only.

### Mobile (Flutter / Repositories)
- None — infrastructure only.

## Acceptance Criteria
- [x] A recorded decision (a or b) is referenced in this file and in `backend/docs/features/BE-16-ai-sdk-postgresql-setup.md` (via Task 87). (Recorded above in this file and in the PRD; the BE-16 doc itself is Task 87's responsibility, as this criterion and the Out of Scope section both say.)
- [x] If (b): no migration references `vector(`, and the PRD §8 text is updated.
- [x] `php artisan migrate:fresh` succeeds on the configured driver(s), and `php artisan test` passes.

### Implemented contract
- Decision: see the decision record above — stay on MySQL, drop the pgvector requirement.
- `entity_embeddings` migration no longer attempts `ALTER TABLE ... TYPE vector(1536)`; both
  `client_preference_vectors.embedding` and `entity_embeddings.embedding` stay `json`, which is
  now documented as the permanent shape rather than a fallback.
- `grep -rn "vector(" modules/*/Database/Migrations/` returns nothing.
- `EmbeddingCast`, `ExploreRanker::cosineSimilarity()`, and `RecomputeClientVectorsCommand` are
  unchanged — they already only ever operated on JSON-decoded float arrays, so there was no
  pgvector-specific code path to remove outside the one dead `ALTER` statement.
- Dashboard/mobile: none, confirmed unchanged (infrastructure-only task).

## Out of Scope
- Pipeline logic fixes (Task 62). Ranking (Task 46).
- Documentation sweep beyond BE-16 (Task 87).
