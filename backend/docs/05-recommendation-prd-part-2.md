---
nodeid: backend.05-recommendation-prd.part-2
parentnode: backend.05-recommendation-prd
childnodes: []
codeanchors:
  - backend/modules/
---

Part 2 of 5 · [PRD Phase 5 — Recommendation Module](05-recommendation-prd.md) · [Previous](05-recommendation-prd.md) · [Next](05-recommendation-prd-part-3.md)

### ValueObjects
- `ClientPreferenceVectorDataValueObject` — wraps vector array + metadata
- `RecommendationFactorWeightsValueObject` — per-client weighting config
- `RecommendationEdgeContextValueObject` — typed context for edge metadata

## 3. Architecture

```
[Cron: Nightly]
  RecomputeRecommendationVectorsCommand
    → Gather signals (favorites, history, face profile, demographics)
    → Generate embedding via laravel/ai (OpenAI text-embedding-3-small)
    → Upsert client_preference_vectors
    → Upsert recommendation_edges (favorite, visited, history)

[Explore endpoint — inline rerank]
  Explore{Barbers|Branches}EloquentResolver
    → Apply new filters (catalog_item_ids, available_now, price_range, rating_min, face_shape_compatible)
    → Haversine distance filter (existing)
    → Composite rerank:
        1. Cosine similarity to client preference vector (if exists)
        2. Edge-weight boost from recommendation_edges
        3. Face-shape compatibility penalty/reward
    → Order by composite score DESC
    → Paginate
```

## 4. Files to Create

### Module: `ClientRecommendation`
```
modules/ClientRecommendation/
  CQRS/Command/RecomputeClientVectorsCommand.php
  Database/Migrations/
    2026_07_19_000001_create_client_preference_vectors_table.php
    2026_07_19_000002_create_recommendation_edges_table.php
  Eloquent/Casts/EmbeddingCast.php
  Enums/EdgeTypeEnum.php
  Models/
    ClientPreferenceVectorModel.php
    RecommendationEdgeModel.php
  Observers/
    ClientFavoriteObserver.php        — Sync edges on favorite/unfavorite
    BookingCompletedObserver.php      — Sync history edges
  ValuesObjects/
    ClientPreferenceVectorDataValueObject.php
    RecommendationFactorWeightsValueObject.php
    RecommendationEdgeContextValueObject.php
  Providers/ClientRecommendationServiceProvider.php
```
