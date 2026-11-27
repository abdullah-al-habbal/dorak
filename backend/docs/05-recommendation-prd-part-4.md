---
codeanchors:
  - backend/modules/
---

Part 4 of 5 · [PRD Phase 5 — Recommendation Module](05-recommendation-prd.md) · [Previous](05-recommendation-prd-part-3.md) · [Next](05-recommendation-prd-part-5.md)

## 7. Nightly Batch Cron

```
Schedule:
  0 2 * * * php artisan recommend:recompute-vectors
  (appended to existing FeaturesScheduleProvider via ->dailyAt('02:00'))
```

Steps:
1. Query all clients with at least one signal (favorite, history, face analysis)
2. For each client, collect signal text (e.g. "visited barber X known for fade haircut, favorited branch specializing in beard grooming, face shape oval")
3. Generate embedding via `Laravel\AI\Embeddings\EmbeddingDriver::embedText($text)`
4. Upsert `client_preference_vectors` for that client
5. Rebuild `recommendation_edges` for `favorite` and `history` edge types
6. Delete expired edges and stale orphan vectors

Batch size: 100 clients per chunk to avoid OOM.

## 8. Migration Steps

1. `CREATE EXTENSION vector;` — run manually or via `php artisan pgsql:create-extension vector`
2. `php artisan make:migration` for both tables
3. Index: `CREATE INDEX idx_preference_vectors ON client_preference_vectors USING ivfflat (embedding vector_cosine_ops);` for approximate nearest-neighbor queries
