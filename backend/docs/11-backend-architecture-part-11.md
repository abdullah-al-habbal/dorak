---
nodeid: backend.11-backend-architecture.part-11
parentnode: backend.11-backend-architecture.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 11 of 19 · [11 — Backend Architecture (C4 Level 3: Components & Conventions)](11-backend-architecture.md) · [Previous](11-backend-architecture-part-10.md) · [Next](11-backend-architecture-part-12.md)

#### ClientInteraction Module

| Operation | Command / Query | Handler | Resolver |
|-----------|-----------------|---------|----------|
| Log interaction event | `LogClientInteractionCommand` | `LogClientInteractionHandler` | `LogClientInteractionEloquentResolver` |
| Client favorites entity | `CreateClientFavoriteCommand` | `CreateClientFavoriteHandler` | `CreateClientFavoriteEloquentResolver` |
| Client unfavorites entity | `DeleteClientFavoriteCommand` | `DeleteClientFavoriteHandler` | `DeleteClientFavoriteEloquentResolver` |
| Client saves filter | `SaveClientFilterCommand` | `SaveClientFilterHandler` | `SaveClientFilterEloquentResolver` |
| Client views favorites | `ListClientFavoritesQuery` | `ListClientFavoritesHandler` | `ListClientFavoritesEloquentResolver` |

```php
// Example: LogClientInteractionCommand
final readonly class LogClientInteractionCommand
{
    public function __construct(
        public string $clientId,
        public string $sessionId,
        public InteractionTypeEnum $interactionType,
        public string $subjectId,
        public string $subjectType,
        public InteractionContextValueObject $context,
    ) {}
}
```

#### Recommendation Module

| Operation | Command / Query | Handler | Resolver |
|-----------|-----------------|---------|----------|
| Nightly: recompute vectors | `RecomputePreferenceVectorsCommand` | `RecomputePreferenceVectorsHandler` | `RecomputePreferenceVectorsEloquentResolver` |
| Nightly: recompute edges | `RecomputeRecommendationEdgesCommand` | `RecomputeRecommendationEdgesHandler` | `RecomputeRecommendationEdgesEloquentResolver` |
| Discovery API reads composite score | `GetRecommendedBranchesQuery` | `GetRecommendedBranchesHandler` | `GetRecommendedBranchesEloquentResolver` |

```php
// Example: RecomputePreferenceVectorsCommand
final readonly class RecomputePreferenceVectorsCommand
{
    public function __construct(
        public ?string $clientId = null,  // null = all active clients
    ) {}
}
```

### 13.5 Phasing (Architecture Order)

| Phase | Module | CQRS Deliverables | Value Objects |
|-------|--------|-------------------|---------------|
| **Phase 1** | `ServiceCatalog` | `Create*Command`, `List*Query`, `Update*Command` | `ServiceCatalogItemMetadataValueObject`, `PriceRangeValueObject` |
| **Phase 2** | `ClientHistory` | `CreateClientServiceHistoryCommand`, `ListClientServiceHistoryQuery` | `ServiceHistoryMetadataValueObject` |
| **Phase 3** | `ClientFaceProfile` | `UploadFaceProfilePhotoCommand`, `StoreFaceAnalysisResultCommand` | `FaceAnalysisFeaturesValueObject`, `RecommendedCatalogItemIdsValueObject` |
| **Phase 4** | `ClientInteraction` | `LogClientInteractionCommand`, `CreateClientFavoriteCommand` | `InteractionContextValueObject`, `FilterConfigurationValueObject` |
| **Phase 5** | `Recommendation` | `RecomputePreferenceVectorsCommand`, `GetRecommendedBranchesQuery` | `ClientPreferenceVectorDataValueObject`, `RecommendationFactorWeightsValueObject`, `RecommendationEdgeContextValueObject` |
