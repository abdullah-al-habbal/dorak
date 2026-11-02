---
nodeid: backend.11-backend-architecture.part-19
parentnode: backend.11-backend-architecture.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 19 of 19 · [11 — Backend Architecture (C4 Level 3: Components & Conventions)](11-backend-architecture.md) · [Previous](11-backend-architecture-part-18.md)

**Recommendation Module (pgvector):**
```php
Schema::ensureVectorExtensionExists();

Schema::create('client_preference_vectors', function (Blueprint $table) {
    $table->id();
    $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
    $table->string('vector_version');
    $table->vector('vector_data', 1536);            // pgvector column
    $table->json('factor_weights');                 // RecommendationFactorWeightsValueObject cast
    $table->timestamp('last_computed_at');
    $table->vectorIndex('vector_data', 'hnsw', 'vector_cosine_ops'); // HNSW index
});

Schema::create('recommendation_edges', function (Blueprint $table) {
    $table->id();
    $table->string('source_type');
    $table->string('source_id');
    $table->string('target_type');
    $table->string('target_id');
    $table->string('edge_type');           // enum backed
    $table->decimal('weight', 5, 2)->default(0.00);
    $table->json('context')->nullable();   // RecommendationEdgeContextValueObject cast
    $table->timestamp('computed_at');
    $table->timestamps();
    $table->index(['source_type', 'source_id']);
    $table->index(['target_type', 'target_id']);
});
```

### 13.9 Implementation Checklist

- [ ] All five modules created with `final` providers in `bootstrap/providers.php`.
- [ ] All Value Objects are `final readonly` with `fromArray()` and `toArray()`.
- [ ] All custom cast classes implement `CastsAttributes` and validate strictly.
- [ ] All enums are Backed Enums used in model casts and FormRequest `Rule::enum` validation.
- [ ] No `array` cast for structured domain data — only Value Object casts.
- [ ] CQRS Commands are immutable `final readonly` classes.
- [ ] Handlers are `final` with single `handle()` method.
- [ ] EloquentResolvers are `final` with single-method resolution.
- [ ] `composer require laravel/ai` installed and published.
- [ ] `.env` switched to `DB_CONNECTION=pgsql` with correct host/port/database.
- [ ] `pgvector` extension enabled (`Schema::ensureVectorExtensionExists()`).
- [ ] `fullText` GIN indexes added to `service_catalog_categories` and `service_catalog_items`.
- [ ] Phase 5 migration uses `$table->vector('vector_data', 1536)` with HNSW index.
- [ ] Dual-strategy search implemented: `whereFullText()` + `whereVectorSimilarTo()`.
- [ ] `composer analyse` passes at max level with zero new errors.
