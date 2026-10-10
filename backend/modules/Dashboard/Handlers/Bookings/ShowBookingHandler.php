<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\Bookings;

use Modules\Booking\Models\BookingModel;
use Modules\Dashboard\CQRS\Query\ShowBookingQuery;
use Modules\Dashboard\Eloquent\Resolvers\Bookings\ShowBookingEloquentResolver;

final readonly class ShowBookingHandler
{
    public function __construct(private ShowBookingEloquentResolver $resolver) {}

    public function handle(ShowBookingQuery $query): BookingModel
    {
        return $this->resolver->resolve($query);
    }
}
