---
nodeid: backend.11-backend-architecture.part-13
parentnode: backend.11-backend-architecture.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 13 of 19 · [11 — Backend Architecture (C4 Level 3: Components & Conventions)](11-backend-architecture.md) · [Previous](11-backend-architecture-part-12.md) · [Next](11-backend-architecture-part-14.md)

### 13.7 Laravel 13 AI Search Strategy

> Full reference material from `laravel-13-ai.md` consolidated here.

#### Dual Search Strategy per Module

Every searchable module uses a **two-tier approach**:

| Tier | Technique | When | Syntax |
|------|-----------|------|--------|
| **Tier 1: Keyword** | `whereFullText()` | User types a search query | `->whereFullText(['name', 'description'], 'fade haircut')` |
| **Tier 2: Semantic** | `whereVectorSimilarTo()` + `rerank()` | AI-powered preference matching | `->whereVectorSimilarTo('embedding', $query)->limit(10)->get()` |

#### Per-Module Mapping

| Phase | Module | Tier 1 (Full-Text) | Tier 2 (Vector/Semantic) |
|-------|--------|--------------------|--------------------------|
| **1** | ServiceCatalog | Browse/search items by name/description. `$table->fullText(['name', 'description'])`. | (Not yet — no client profile) |
| **2** | ClientHistory | Search barber notes, service names. | (Not yet — no vector data) |
| **3** | FaceProfile | — | AI recommends items from face shape analysis via `whereIn('catalog_item_ids')` (API-driven, not vector). |
| **4** | Interaction | Filter logs by interaction_type, date range via `where` clauses. | — |
| **5** | Recommendation | — | `whereVectorSimilarTo('vector_data', $embedding, minSimilarity: 0.6)` for "clients like you" ranking. `rerank()` on results for final scoring. |

#### Bilingual Full-Text Search (PostgreSQL)

Spatie Translatable stores `{"en": "Fade Haircut", "ar": "قصة شعر فيد"}` as JSON. PostgreSQL's `to_tsvector()` cannot directly index JSON columns.

**Solution:** Add a dedicated `searchable_text` column with a GIN tsvector index:

```php
// Migration
Schema::table('service_catalog_items', function (Blueprint $table) {
    $table->text('searchable_text')->nullable()->after('description');
});
DB::statement('CREATE INDEX items_search_gin ON service_catalog_items USING GIN (to_tsvector(\'simple\', searchable_text))');

// Model: auto-populate searchable_text from translatable JSON
protected static function booted(): void
{
    static::saving(function ($model) {
        $name = $model->getTranslations('name');
        $desc = $model->getTranslations('description');
        $model->searchable_text = implode(' ', array_filter([
            $name['en'] ?? '', $name['ar'] ?? '',
            $desc['en'] ?? '', $desc['ar'] ?? '',
        ]));
    });
}
```
