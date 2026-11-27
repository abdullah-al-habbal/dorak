---
nodeid: backend.05-recommendation-prd
parentnode: backend.docs
childnodes:
  - backend.05-recommendation-prd.part-2
  - backend.05-recommendation-prd.part-3
  - backend.05-recommendation-prd.part-4
  - backend.05-recommendation-prd.part-5
codeanchors:
  - backend/modules/
---

# PRD Phase 5 — Recommendation Module

> This is the design written before the module was built. The database is MySQL, so its PostgreSQL and pgvector parts don't apply. For what exists, read `modules/ClientRecommendation`.

## 1. Objective

Personalise explore results so clients see relevant barbers/branches first. Two-tier:
- **Tier 1 (explicit signals):** boost results by client history, favorites, face-shape compatibility
- **Tier 2 (vector similarity):** pgvector cosine-similarity against nightly-computed preference embeddings

Both tiers degrade gracefully — no vector = fall back to pure geographic proximity.

## 2. Data Model

### Table: `client_preference_vectors`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `ulid` PK | |
| `client_id` | `ulid` FK → `clients.id` | Unique |
| `embedding` | `vector(1536)` | OpenAI `text-embedding-3-small` |
| `metadata` | `jsonb` | Snapshot of signals used to compute |
| `computed_at` | `timestamp` | |
| `created_at` | `timestamp` | |
| `updated_at` | `timestamp` | |

### Table: `recommendation_edges`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `ulid` PK | |
| `source_type` | `string` | Morph — `client`, `client_face_profile` |
| `source_id` | `ulid` | |
| `target_type` | `string` | Morph — `branch`, `barber`, `catalog_item` |
| `target_id` | `ulid` | |
| `edge_type` | `string` | Enum: `favorite`, `visited`, `history`, `face_matched`, `similar_client` |
| `weight` | `float` | 0.0–1.0 |
| `context` | `jsonb` | Arbitrary edge metadata |
| `expires_at` | `timestamp` | Nullable TTL |
| `created_at` | `timestamp` | |

### Enum: `EdgeTypeEnum`
```php
case Favorite = 'favorite';
case Visited = 'visited';
case History = 'history';
case FaceMatched = 'face_matched';
case SimilarClient = 'similar_client';
```

## Continued in

- [Part 2: ValueObjects](05-recommendation-prd-part-2.md)
- [Part 3: Modifications (existing files)](05-recommendation-prd-part-3.md)
- [Part 4: 7. Nightly Batch Cron](05-recommendation-prd-part-4.md)
- [Part 5: 9. Test Plan](05-recommendation-prd-part-5.md)
