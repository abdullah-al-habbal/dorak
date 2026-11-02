---
nodeid: backend.11-backend-architecture.part-8
parentnode: backend.11-backend-architecture.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 8 of 19 · [11 — Backend Architecture (C4 Level 3: Components & Conventions)](11-backend-architecture.md) · [Previous](11-backend-architecture-part-7.md) · [Next](11-backend-architecture-part-9.md)

```
modules/
├── ServiceCatalog/           # Canonical taxonomy
│   ├── Models/
│   │   ├── ServiceCatalogCategoryModel.php
│   │   ├── ServiceCatalogItemModel.php
│   │   ├── ServiceCatalogItemTagModel.php
│   │   ├── ServiceCatalogItemTagAssignmentModel.php
│   │   └── ServiceCatalogItemMediaModel.php
│   ├── ValuesObjects/
│   │   ├── ServiceCatalogItemMetadataValueObject.php
│   │   └── PriceRangeValueObject.php
│   ├── Enums/
│   │   ├── FaceShapeEnum.php
│   │   ├── HairTextureEnum.php
│   │   ├── MaintenanceLevelEnum.php
│   │   ├── StylePeriodEnum.php
│   │   └── FormalityEnum.php
│   ├── Http/
│   │   ├── Actions/
│   │   ├── Requests/
│   │   └── ...
│   ├── Handlers/
│   ├── Eloquent/Resolvers/
│   ├── CQRS/
│   │   ├── Command/
│   │   └── Query/
│   ├── Database/Migrations/
│   ├── Filament/Admin/
│   └── Providers/ServiceCatalogServiceProvider.php
│
├── ClientHistory/            # Service history journal
│   ├── Models/
│   │   ├── ClientServiceHistoryModel.php
│   │   └── ClientServiceHistoryMediaModel.php
│   ├── ValuesObjects/
│   │   └── ServiceHistoryMetadataValueObject.php
│   ├── Http/Actions/
│   ├── Handlers/
│   ├── Eloquent/Resolvers/
│   └── Providers/ClientHistoryServiceProvider.php
│
├── ClientFaceProfile/        # AI onboarding data
│   ├── Models/
│   │   ├── ClientFaceProfileModel.php
│   │   └── ClientFaceAnalysisResultModel.php
│   ├── ValuesObjects/
│   │   ├── FaceAnalysisFeaturesValueObject.php
│   │   └── RecommendedCatalogItemIdsValueObject.php
│   ├── Enums/
│   │   └── DetectedFaceShapeEnum.php
│   ├── Http/Actions/
│   ├── Handlers/
│   ├── Eloquent/Resolvers/
│   └── Providers/ClientFaceProfileServiceProvider.php
│
├── ClientInteraction/        # Tracking, favorites, filters
│   ├── Models/
│   │   ├── ClientInteractionLogModel.php
```
