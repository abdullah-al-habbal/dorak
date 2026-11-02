---
nodeid: backend.11-backend-architecture.part-9
parentnode: backend.11-backend-architecture.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 9 of 19 · [11 — Backend Architecture (C4 Level 3: Components & Conventions)](11-backend-architecture.md) · [Previous](11-backend-architecture-part-8.md) · [Next](11-backend-architecture-part-10.md)

```
│   │   ├── ClientFavoriteModel.php
│   │   ├── ClientSavedFilterModel.php
│   │   └── ClientDiscoveryPreferenceModel.php
│   ├── ValuesObjects/
│   │   ├── InteractionContextValueObject.php
│   │   └── FilterConfigurationValueObject.php
│   ├── Enums/
│   │   └── InteractionTypeEnum.php
│   ├── Http/Actions/
│   ├── Handlers/
│   ├── Eloquent/Resolvers/
│   └── Providers/ClientInteractionServiceProvider.php
│
└── Recommendation/           # Graph edges & vectors
    ├── Models/
    │   ├── ClientPreferenceVectorModel.php
    │   └── RecommendationEdgeModel.php
    ├── ValuesObjects/
    │   ├── ClientPreferenceVectorDataValueObject.php
    │   ├── RecommendationFactorWeightsValueObject.php
    │   └── RecommendationEdgeContextValueObject.php
    ├── Enums/
    │   └── EdgeTypeEnum.php
    ├── Console/Commands/     # Nightly batch job
    │   └── RecomputeRecommendationVectorsCommand.php
    ├── Http/Actions/
    ├── Handlers/
    ├── Eloquent/Resolvers/
    └── Providers/RecommendationServiceProvider.php
```

**Registration:** Each provider is explicitly added to `bootstrap/providers.php`. No auto-discovery. Models use `#[Fillable]` and `#[Hidden]` PHP attributes.

### 13.4 CQRS Command & Query Specifications

Every write is a **Command**. Every read is a **Query**. Each flows through `Request → Action → Handler → EloquentResolver`.
