# BE-16 — AI SDK & PostgreSQL Setup

## Status: ✅ Complete
## Frontend Consumer: — (infrastructure layer)

## What Was Built
- **Database**: MySQL (`DB_CONNECTION=mysql` in `.env.example`; tests use sqlite). pgvector was never provisioned and the requirement was dropped (Task 63); embeddings are stored as JSON and cosine similarity is computed in PHP
- **AI SDK**: `laravel/ai` v0.9.1 installed via composer; `config/ai.php` published with 15 providers (OpenAI, Anthropic, Gemini, etc.)
- **Migrations**: `agent_conversations` + `agent_conversation_messages` tables published & migrated
- **Artisan commands**: `make:agent`, `make:tool`, `make:agent-middleware` scaffolding commands available
- `ClientPreferenceVectorModel` — embedding storage with JSON storage (the permanent shape, Task 63)
- `EntityEmbeddingModel` — polymorphic entity embeddings (branch/barber) for cosine similarity ranking
- `RecomputeClientVectorsCommand` (`recommend:recompute-vectors`) — nightly batch, chunks 100, gathers signals, calls OpenAI embeddings; recomputes entity embeddings for branches and barbers

## API Endpoints (none — infrastructure layer)
No public API endpoints. This feature provides database and AI infrastructure consumed by the Recommendation module (BE-15) and Explore enhancements (BE-17).

## Response Schemas (none)
## Tests: 0 dedicated — infrastructure setup only
