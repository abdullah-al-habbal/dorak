---
nodeid: skills.backend.cqrs-pattern.references.read-example
parentnode: skills.backend.cqrs-pattern
childnodes:
  - skills.backend.cqrs-pattern.references.read-example.part-2
codeanchors:
  - backend/modules/
---

Referenced from [`../SKILL.md`](../SKILL.md).

## Read example: List bookings

### Query

```php
<?php
declare(strict_types=1);

namespace Modules\Booking\CQRS\Query;

final class ListAllBookingsQuery
{
    public function __construct(
        public readonly ?string $status = null,
        public readonly int $perPage = 15,
    ) {}
}
```

### Resolver

```php
<?php
declare(strict_types=1);

namespace Modules\Booking\Eloquent\Resolvers;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Modules\Booking\Models\Booking;

final class ListAllBookingsEloquentResolver
{
    public function resolve(place the command or the query class based on the api in this case ListAllBookingsQuery $query): Model|Collection|array|null
    {
        return Booking::query()
            ->when($query->status, fn ($q) => $q->where('status', $query->status))
            ->paginate($query->perPage);
    }
}
```

## Continued in

- [Part 2: Handler](read-example-part-2.md)
