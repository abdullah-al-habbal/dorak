<?php

declare(strict_types=1);

namespace Modules\Booking\Handlers\Shared;

use Carbon\Carbon;
use Modules\Booking\CQRS\Query\Shared\ListSlotsQuery;
use Modules\Booking\Eloquent\Resolvers\Shared\ListSlotsEloquentResolver;

final class ListSlotsHandler
{
    public function __construct(
        private readonly ListSlotsEloquentResolver $resolver,
    ) {}

    /**
     * @return list<array{starts_at: Carbon, ends_at: Carbon}>
     */
    public function handle(ListSlotsQuery $query): array
    {
        return $this->resolver->resolve($query);
    }
}
