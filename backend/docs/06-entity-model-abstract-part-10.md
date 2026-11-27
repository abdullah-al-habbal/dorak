---
codeanchors:
  - backend/modules/
---

Part 10 of 13 · [06 — Entity Model (Abstract)](06-entity-model-abstract.md) · [Previous](06-entity-model-abstract-part-9.md) · [Next](06-entity-model-abstract-part-11.md)

### 6.4 Discovery Preferences & Interaction Tracking

**ClientDiscoveryPreferenceModel** — *Explicit preferences collected during onboarding or profile editing.*
- `id` (UUID)
- `client_id` (FK)
- `style_period_preference` (enum: `classic` / `modern` / `no_preference`)
- `maintenance_level_preference` (enum: `low` / `medium` / `high` / `no_preference`)
- `length_preference` (enum: `short` / `medium` / `long` / `no_preference`)
- `price_sensitivity` (enum: `budget` / `moderate` / `premium` / `no_preference`)
- `preferred_max_distance_km` (integer, nullable)
- `updated_at` (datetime)

**ClientInteractionLogModel** — *Immutable behavioral event log.*
- `id` (UUID)
- `client_id` (FK)
- `session_id` (string, 64 chars — groups events into a single discovery session)
- `interaction_type` (enum: `viewed_branch`, `viewed_barber`, `viewed_catalog_item`, `searched`, `favorited`, `unfavorited`, `booked`, `reviewed`, `shared_location`)
- `subject_id` (UUID)
- `subject_type` (string) — polymorphic class name
- `context` (JSON) — cast to `InteractionContextValueObject`: snapshot of filters at time of interaction:
  ```json
  {
    "universe": "men",
    "applied_filters": {"radius_km": 5, "catalog_item_ids": ["uuid1"], "rating_min": 4},
    "search_query": "fade",
    "screen": "explore"
  }
  ```
- `occurred_at` (datetime)

**ClientFavoriteModel** — *Private bookmarks.*
- `id` (UUID)
- `client_id` (FK)
- `favoritable_id` (UUID)
- `favoritable_type` (string) — polymorphic: BranchModel, BarberModel, BrandModel, ServiceCatalogItemModel
- `notes` (text, nullable — e.g., "try this next time")
- `created_at` (datetime)

**ClientSavedFilterModel** — *Named saved searches.*
- `id` (UUID)
- `client_id` (FK)
- `filter_name` (string, e.g., "Barbers within 2km who do fades")
- `filter_configuration` (JSON) — cast to `FilterConfigurationValueObject`
- `created_at` (datetime)
