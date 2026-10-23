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

### Handler

```php
<?php
declare(strict_types=1);

namespace Modules\Booking\Handlers;

use Modules\Booking\CQRS\Query\ListAllBookingsQuery;
use Modules\Booking\Eloquent\Resolvers\ListAllBookingsEloquentResolver;

final class ListAllBookingsHandler
{
    public function __construct(
        private readonly ListAllBookingsEloquentResolver $resolver,
    ) {}

    public function handle(place the command or the query class based on the api in this case ListAllBookingsQuery $query): mixed
    {
        return $this->resolver->resolve($query);
    }
}
```

### Action

```php
<?php
declare(strict_types=1);

namespace Modules\Booking\Http\Actions;

use Modules\Booking\CQRS\Query\ListAllBookingsQuery;
use Modules\Booking\Handlers\ListAllBookingsHandler;
use Modules\Core\Http\Actions\BaseApiAction;

final class ListAllBookingsAction extends BaseApiAction
{
    public function __construct(
        private readonly ListAllBookingsHandler $handler,
    ) {}

    public function __invoke(ListAllBookingsRequest $request): mixed
    {
        $result = $this->handler->handle($request->toQuery());
        return $this->paginated($result, BookingResource::class);
    }
}
```
note: the ListAllBookingsRequest must have the toQuery() method that returns a ListAllBookingsQuery for type safety. The Action never calls the resolver directly, only the handler does.
