---
nodeid: backend.11-backend-architecture.part-14
parentnode: backend.11-backend-architecture.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 14 of 19 · [11 — Backend Architecture (C4 Level 3: Components & Conventions)](11-backend-architecture.md) · [Previous](11-backend-architecture-part-13.md) · [Next](11-backend-architecture-part-15.md)

#### Vector Search for Recommendation Engine (Phase 5)

```php
// 1. Generate client preference embedding
$embedding = AI::embeddings()->create($clientPreferenceText);

// 2. Find similar clients via cosine similarity
$similarClients = ClientPreferenceVectorModel::query()
    ->whereVectorSimilarTo('vector_data', $embedding, minSimilarity: 0.6)
    ->limit(20)
    ->get();

// 3. Rerank for final precision
$ranked = $similarClients->rerank('factor_weights', $query);
```

#### PostgreSQL pgvector Setup

**Always use PostgreSQL** for Laravel 13 AI features. Key differences from MySQL:

| Concern | PostgreSQL + pgvector | MySQL (Rejected) |
|---------|----------------------|------------------|
| **Vector Search** | Native `whereVectorSimilarTo()` + HNSW indexes | JSON column + manual scoring only |
| **Full-Text Search** | `whereFullText()` with `to_tsvector`, GIN indexes | FULLTEXT on plain text only |
| **AI SDK Integration** | `SimilaritySearch` tool, `rerank()`, `Embeddings::for()` | No native integration |
| **Laravel 13 Native** | `$table->vector()`, `$table->vectorIndex()` | Community packages only |

**Migration pattern for vector columns:**
```php
Schema::ensureVectorExtensionExists(); // Enable pgvector extension

Schema::create('client_preference_vectors', function (Blueprint $table) {
    $table->id();
    $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
    $table->string('vector_version');
    $table->vector('vector_data', 1536);  // pgvector column
    $table->json('factor_weights');        // RecommendationFactorWeightsValueObject cast
    $table->timestamp('last_computed_at');
    $table->vectorIndex('vector_data', 'hnsw', 'vector_cosine_ops');  // HNSW for fast similarity
});
```
