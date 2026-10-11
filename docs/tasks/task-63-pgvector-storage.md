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
- Decision required: target production database. Either:
  - **(a)** move to PostgreSQL + pgvector, per BE-16; or
  - **(b)** stay on MySQL and formally drop the pgvector requirement, keeping JSON + PHP similarity and updating the PRD.

  This task cannot be completed until that choice is made.
- If (a):
  - Add a migration that converts `client_preference_vectors.embedding` to `vector(1536)` when the driver is `pgsql`.
  - Create an HNSW (or ivfflat) cosine index on both vector tables.
  - Update `EmbeddingCast` for the native type.
  - Add a pgsql CI job (with a pgvector service) so vector code paths are tested. Keep SQLite for fast unit tests.
- If (b): remove the dead `ALTER` branch and document the JSON approach.
- Either way: no silent `catch` fallback. A failed migration on pgsql must fail loudly.

### Dashboard (BFF / React)
- None — infrastructure only.

### Mobile (Flutter / Repositories)
- None — infrastructure only.

## Acceptance Criteria
- [ ] A recorded decision (a or b) is referenced in this file and in `backend/docs/features/BE-16-ai-sdk-postgresql-setup.md` (via Task 87).
- [ ] If (a): on a pgsql + pgvector database, `\d client_preference_vectors` shows `embedding vector(1536)`, and an HNSW/ivfflat index exists on both tables (migration test or CI assertion).
- [ ] If (a): the CI workflow includes a pgsql job that runs the recommendation tests and passes.
- [ ] If (b): no migration references `vector(`, and the PRD §8 text is updated.
- [ ] `php artisan migrate:fresh` succeeds on the configured driver(s), and `php artisan test` passes.

## Out of Scope
- Pipeline logic fixes (Task 62). Ranking (Task 46).
- Documentation sweep beyond BE-16 (Task 87).
