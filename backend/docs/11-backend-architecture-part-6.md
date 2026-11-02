---
nodeid: backend.11-backend-architecture.part-6
parentnode: backend.11-backend-architecture.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 6 of 19 · [11 — Backend Architecture (C4 Level 3: Components & Conventions)](11-backend-architecture.md) · [Previous](11-backend-architecture-part-5.md) · [Next](11-backend-architecture-part-7.md)

## 13. Architecture-Aligned PRD (Client Intelligence — v2.0)

> Migrated from `prd.md` §0-10. This section adapts the Client Intelligence PRD to the native Dorak patterns: **Action → Handler → EloquentResolver**, `final readonly` Value Objects, CQRS (Command/Query), and `declare(strict_types=1)`. Cross-references to `02-prd.md` §12 (full PRD) and `06-entity-model-abstract.md` §6 (entity definitions).

### 13.1 Architecture Alignment Statement

Every JSON field in the v1.0 PRD is replaced with a **typed Value Object** stored as PostgreSQL JSON but hydrated into strict objects via Eloquent casts. No `array` casts for domain data — only `ValueObject::class` casts or custom cast classes.

**Rule:** If a column stores structured data, it is represented in PHP as a `final readonly class` in `{Module}/ValuesObjects/` — never as an untyped `array`.

### 13.2 Value Object Catalog

All Value Objects are `final readonly` classes with typed properties, living in `{Module}/ValuesObjects/`.

| Value Object | Module | Properties | Stored In |
|-------------|--------|------------|-----------|
| `ServiceCatalogItemMetadataValueObject` | `ServiceCatalog` | `suitableFaceShapes: array<FaceShapeEnum>`, `suitableHairTextures: array<HairTextureEnum>`, `maintenanceLevel: MaintenanceLevelEnum`, `stylePeriod: StylePeriodEnum`, `formality: FormalityEnum` | `service_catalog_items.metadata` |
| `PriceRangeValueObject` | `ServiceCatalog` | `min: int`, `max: int`, `currencyCode: string` | `service_catalog_items.typical_price_range` |
| `ServiceHistoryMetadataValueObject` | `ClientHistory` | `productsUsed: array<string>`, `lengthSettings: array<string>`, `colorCodes: array<string>` | `client_service_histories.metadata` |
| `FaceAnalysisFeaturesValueObject` | `ClientFaceProfile` | `foreheadWidth: int`, `jawAngle: int`, `cheekboneProminence: string` | `client_face_analysis_results.detected_features` |
| `RecommendedCatalogItemIdsValueObject` | `ClientFaceProfile` | `ids: array<string>` (UUIDs) | `client_face_analysis_results.recommended_catalog_item_ids` |
| `FilterConfigurationValueObject` | `ClientInteraction` | `radiusKm: int\|null`, `catalogItemIds: array<string>`, `ratingMin: int\|null`, `priceMax: int\|null` | embedded in `InteractionContextValueObject` |
| `InteractionContextValueObject` | `ClientInteraction` | `universe: UniverseEnum`, `appliedFilters: FilterConfigurationValueObject`, `searchQuery: string\|null`, `screen: string` | `client_interaction_logs.context` |
| `ClientPreferenceVectorDataValueObject` | `Recommendation` | `tagAffinity: array<string, float>`, `priceMidpoint: int`, `avgDistanceKm: float` | `client_preference_vectors.vector_data` |
| `RecommendationFactorWeightsValueObject` | `Recommendation` | `proximity: float`, `preferenceMatch: float`, `trending: float`, `rating: float` | `client_preference_vectors.factor_weights` |
| `RecommendationEdgeContextValueObject` | `Recommendation` | `universe: UniverseEnum`, `season: string`, `locationRadiusKm: int` | `recommendation_edges.context` |

**Casting Strategy:** Each Value Object implements a static `fromArray(array $data): self` and `toArray(): array`. Eloquent models use custom cast classes (e.g., `ServiceCatalogItemMetadataCast`) that delegate to these methods. See §13.6 for the cast pattern.
