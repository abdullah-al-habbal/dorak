<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Bookings;

use Illuminate\Pagination\LengthAwarePaginator;
use Modules\Dashboard\CQRS\Query\ListBookingsQuery;
use Modules\Dashboard\Eloquent\Resolvers\Bookings\ListBookingsEloquentResolver;

final readonly class ListBookingsHandler
{
    public function __construct(private ListBookingsEloquentResolver $resolver) {}

    public function handle(ListBookingsQuery $query): LengthAwarePaginator
    {
        return $this->resolver->resolve($query);
    }
}
