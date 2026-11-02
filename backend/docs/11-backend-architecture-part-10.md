---
nodeid: backend.11-backend-architecture.part-10
parentnode: backend.11-backend-architecture.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 10 of 19 · [11 — Backend Architecture (C4 Level 3: Components & Conventions)](11-backend-architecture.md) · [Previous](11-backend-architecture-part-9.md) · [Next](11-backend-architecture-part-11.md)

#### ServiceCatalog Module

| Operation | Command / Query | Handler | Resolver |
|-----------|-----------------|---------|----------|
| Admin creates category | `CreateServiceCatalogCategoryCommand` | `CreateServiceCatalogCategoryHandler` | `CreateServiceCatalogCategoryEloquentResolver` |
| Admin creates item | `CreateServiceCatalogItemCommand` | `CreateServiceCatalogItemHandler` | `CreateServiceCatalogItemEloquentResolver` |
| Admin updates item | `UpdateServiceCatalogItemCommand` | `UpdateServiceCatalogItemHandler` | `UpdateServiceCatalogItemEloquentResolver` |
| Client browses catalog | `ListServiceCatalogItemsQuery` | `ListServiceCatalogItemsHandler` | `ListServiceCatalogItemsEloquentResolver` |
| Client views item detail | `ShowServiceCatalogItemQuery` | `ShowServiceCatalogItemHandler` | `ShowServiceCatalogItemEloquentResolver` |

```php
// Example: CreateServiceCatalogItemCommand
declare(strict_types=1);
final readonly class CreateServiceCatalogItemCommand
{
    public function __construct(
        public string $categoryId,
        public array $name,           // translatable map
        public array $description,   // translatable map
        public int $defaultDurationMinutes,
        public PriceRangeValueObject $priceRange,
        public ServiceCatalogItemMetadataValueObject $metadata,
    ) {}
}
```

#### ClientHistory Module

| Operation | Command / Query | Handler | Resolver |
|-----------|-----------------|---------|----------|
| System auto-creates history on booking completion | `CreateClientServiceHistoryCommand` | `CreateClientServiceHistoryHandler` | `CreateClientServiceHistoryEloquentResolver` |
| Client views timeline | `ListClientServiceHistoryQuery` | `ListClientServiceHistoryHandler` | `ListClientServiceHistoryEloquentResolver` |
| Client adds media to entry | `AttachHistoryMediaCommand` | `AttachHistoryMediaHandler` | `AttachHistoryMediaEloquentResolver` |
| Client rebooks from history | `RebookFromHistoryCommand` | `RebookFromHistoryHandler` | `RebookFromHistoryEloquentResolver` |

**Rule:** `CreateClientServiceHistoryCommand` is dispatched from a `BookingModel` observer or from the `CompleteBookingHandler` in the Booking module (cross-module call via command bus).

#### ClientFaceProfile Module

| Operation | Command / Query | Handler | Resolver |
|-----------|-----------------|---------|----------|
| Client uploads face photo | `UploadFaceProfilePhotoCommand` | `UploadFaceProfilePhotoHandler` | `UploadFaceProfilePhotoEloquentResolver` |
| System queues AI analysis | `RequestFaceAnalysisCommand` | `RequestFaceAnalysisHandler` | `RequestFaceAnalysisEloquentResolver` |
| System stores AI result | `StoreFaceAnalysisResultCommand` | `StoreFaceAnalysisResultHandler` | `StoreFaceAnalysisResultEloquentResolver` |
| Client views recommendations | `GetFaceBasedRecommendationsQuery` | `GetFaceBasedRecommendationsHandler` | `GetFaceBasedRecommendationsEloquentResolver` |

```php
// Example: UploadFaceProfilePhotoCommand
final readonly class UploadFaceProfilePhotoCommand
{
    public function __construct(
        public string $clientId,
        public string $imageUrl,
        public string $imageHash,
        public bool $isPrimary,
    ) {}
}
```
