---
codeanchors:
  - backend/modules/
---

Part 8 of 13 · [06 — Entity Model (Abstract)](06-entity-model-abstract.md) · [Previous](06-entity-model-abstract-part-7.md) · [Next](06-entity-model-abstract-part-9.md)

### 6.1 Service Catalog & Taxonomy

**ServiceCatalogCategoryModel**
- `id` (UUID)
- `name` (translatable: ar/en)
- `universe` (enum: `men` / `women` / `unisex`) — which universe this category appears in
- `sort_order` (integer)
- `is_active` (boolean)

**ServiceCatalogItemModel** — *The canonical "haircut type" or "service type."*
- `id` (UUID)
- `category_id` (FK → ServiceCatalogCategoryModel)
- `name` (translatable: ar/en)
- `description` (translatable: ar/en)
- `default_duration_minutes` (integer)
- `typical_price_range` (JSON) — cast to `PriceRangeValueObject`
- `metadata` (JSON) — cast to `ServiceCatalogItemMetadataValueObject`:
  ```json
  {
    "suitable_face_shapes": ["oval", "round", "square"],
    "suitable_hair_textures": ["straight", "wavy", "curly", "coily"],
    "maintenance_level": "low",
    "style_period_type": "modern",
    "formality": "casual"
  }
  ```
- `is_active` (boolean)

**ServiceCatalogItemTagModel** — *Tags for filtering (e.g., "trending", "classic", "low-maintenance").*
- `id` (UUID)
- `name` (translatable: ar/en)
- `slug` (string, unique)

**ServiceCatalogItemTagAssignmentModel** — *Pivot between item and tag.*
- `catalog_item_id` (FK)
- `tag_id` (FK)

**ServiceCatalogItemMediaModel** — *Example images/videos for the style.*
- `id` (UUID)
- `catalog_item_id` (FK)
- `media_url` (string)
- `media_type` (enum: `image` / `video`)
- `sort_order` (integer)
