---
nodeid: backend.11-backend-architecture.part-12
parentnode: backend.11-backend-architecture.group-1
childnodes: []
codeanchors:
  - backend/modules/
---

Part 12 of 19 · [11 — Backend Architecture (C4 Level 3: Components & Conventions)](11-backend-architecture.md) · [Previous](11-backend-architecture-part-11.md) · [Next](11-backend-architecture-part-13.md)

### 13.6 Custom Cast Pattern

Since Eloquent does not natively cast to Value Objects, each module provides a cast class in `{Module}/Eloquent/Casts/`.

```php
// Example: ServiceCatalogItemMetadataCast
declare(strict_types=1);
final class ServiceCatalogItemMetadataCast implements CastsAttributes
{
    public function get($model, string $key, $value, array $attributes): ?ServiceCatalogItemMetadataValueObject
    {
        if ($value === null) {
            return null;
        }
        return ServiceCatalogItemMetadataValueObject::fromArray(json_decode($value, true));
    }

    public function set($model, string $key, $value, array $attributes): ?string
    {
        if ($value === null) {
            return null;
        }
        if (!$value instanceof ServiceCatalogItemMetadataValueObject) {
            throw new \InvalidArgumentException('Value must be a ServiceCatalogItemMetadataValueObject');
        }
        return json_encode($value->toArray());
    }
}
```

**Model registration:**
```php
'metadata' => ServiceCatalogItemMetadataCast::class,
```
