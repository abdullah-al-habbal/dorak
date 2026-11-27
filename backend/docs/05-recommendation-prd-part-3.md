---
codeanchors:
  - backend/modules/
---

Part 3 of 5 · [PRD Phase 5 — Recommendation Module](05-recommendation-prd.md) · [Previous](05-recommendation-prd-part-2.md) · [Next](05-recommendation-prd-part-4.md)

### Modifications (existing files)

| File | Change |
|------|--------|
| `config/ai.php` | Possibly add `use_embeddings` flag for env |
| `modules/Explore/Http/Requests/Shared/ExploreBranchesRequest.php` | Add new filter params |
| `modules/Explore/Http/Requests/Shared/ExploreBarbersRequest.php` | Add new filter params |
| `modules/Explore/CQRS/Query/Shared/ExploreBranchesQuery.php` | Add new filter fields |
| `modules/Explore/CQRS/Query/Shared/ExploreBarbersQuery.php` | Add new filter fields |
| `modules/Explore/Eloquent/Resolvers/Shared/ExploreBranchesEloquentResolver.php` | Apply filters + composite ranking |
| `modules/Explore/Eloquent/Resolvers/Shared/ExploreBarbersEloquentResolver.php` | Apply filters + composite ranking |
| `modules/Explore/Http/Resources/Shared/BranchResource.php` | Add `compatibility_score`, `rank` |
| `modules/Explore/Http/Resources/Shared/BarberResource.php` | Add `compatibility_score`, `rank` |
| `bootstrap/providers.php` | Register `ClientRecommendationServiceProvider` |

### Console command
```
php artisan recommend:recompute-vectors {--client-id=} {--force}
```
- No args → recompute all clients (nightly batch)
- `--client-id` → recompute single client (on-demand after booking)
- `--force` → skip freshness check

Add to kernel schedule for 2 AM daily.

## 5. New Explore Filters

| Param | Type | Location | Behavior |
|-------|------|----------|----------|
| `catalog_item_ids[]` | `ulid[]` | Request+Query | Filter to branches/barbers offering at least one of these catalog items |
| `available_now` | `boolean` | Request+Query | Filter to barbers/branches with available chairs in current time slot |
| `price_range[min]` | `float` | Request+Query | Min offered service price |
| `price_range[max]` | `float` | Request+Query | Max offered service price |
| `rating_min` | `float` | Request+Query | Min average rating (from reviews if exists, else omit) |
| `face_shape_compatible` | `string` | Request+Query | Filter to catalog items matching the client's face shape analysis |

Universe param stays for branches. Barbers endpoint stays universe-less.

## 6. Ranking Formula

```
composite_score = (1 - α - β - γ) * geographic_score
                + α * preference_vector_similarity
                + β * edge_weight_boost
                + γ * face_shape_compatibility

Default weights: α=0.4, β=0.3, γ=0.1 (geographic remains 0.2)

Where:
  geographic_score           = 1 / (1 + distance_km / radius)
  preference_vector_similarity = cosine(client.embedding, target.embedding)
  edge_weight_boost          = max(edge.weight) for client→target edges
  face_shape_compatibility   = 1.0 if compatible, 0.0 otherwise
```

No vector available → α=0, remaining weight redistributed proportionally.
