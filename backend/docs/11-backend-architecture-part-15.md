---
nodeid: backend.11-backend-architecture.part-15
parentnode: backend.11-backend-architecture.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 15 of 19 · [11 — Backend Architecture (C4 Level 3: Components & Conventions)](11-backend-architecture.md) · [Previous](11-backend-architecture-part-14.md) · [Next](11-backend-architecture-part-16.md)

#### Laravel AI SDK Installation

```bash
composer require laravel/ai
php artisan vendor:publish --provider="Laravel\Ai\AiServiceProvider"
php artisan migrate  # Creates agent_conversations + agent_conversation_messages tables
```

Configure `.env` with the chosen embedding provider (default: OpenAI, 1536 dimensions):
```ini
OPENAI_API_KEY=sk-...
# Or for open-source:
OLLAMA_API_KEY=
OPENAI_COMPATIBLE_URL=http://localhost:11434/v1
OPENAI_COMPATIBLE_API_KEY=
```

#### AI Agent Integration (Future — Post-MVP)

The `SimilaritySearch` tool enables RAG-style agents for ServiceCatalog:
```php
SimilaritySearch::usingModel(
    model: ServiceCatalogItemModel::class,
    column: 'metadata',
    minSimilarity: 0.7,
    limit: 5,
    query: fn ($query) => $query->where('is_active', true),
),
```
