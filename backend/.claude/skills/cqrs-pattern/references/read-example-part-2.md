---
nodeid: skills.backend.cqrs-pattern.references.read-example.part-2
parentnode: skills.backend.cqrs-pattern.references.read-example
childnodes: []
codeanchors:
  - backend/modules/
---

Part 2 of 2 · [read example](read-example.md) · [Previous](read-example.md)

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
