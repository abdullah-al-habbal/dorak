---
nodeid: backend.06-entity-model-abstract.part-11
parentnode: backend.06-entity-model-abstract
childnodes: []
codeanchors:
  - backend/modules/
---

Part 11 of 13 · [06 — Entity Model (Abstract)](06-entity-model-abstract.md) · [Previous](06-entity-model-abstract-part-10.md) · [Next](06-entity-model-abstract-part-12.md)

### 6.5 Recommendation Engine

**ClientPreferenceVectorModel** — *Computed dense preference profile.*
- `id` (UUID)
- `client_id` (FK)
- `vector_version` (string) — schema version of the vector
- `vector_data` (vector, 1536 dimensions) — pgvector column storing the client's preference embedding
- `factor_weights` (JSON) — cast to `RecommendationFactorWeightsValueObject`:
  ```json
  {"proximity": 0.3, "preference_match": 0.4, "trending": 0.2, "rating": 0.1}
  ```
- `last_computed_at` (datetime)

**RecommendationEdgeModel** — *Weighted edge in the recommendation graph.*
- `id` (UUID)
- `source_id` (UUID)
- `source_type` (string) — polymorphic
- `target_id` (UUID)
- `target_type` (string) — polymorphic
- `edge_type` (enum: `client_preferred`, `similar_style`, `often_booked_with`, `trending_nearby`, `face_shape_compatible`)
- `weight` (decimal, 0.00–1.00)
- `context` (JSON) — cast to `RecommendationEdgeContextValueObject`
- `computed_at` (datetime)

---
