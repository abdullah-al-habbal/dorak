<?php

declare(strict_types=1);

namespace Modules\Booking\Eloquent\Resolvers\Client;

use Modules\Booking\CQRS\Command\Client\CancelBookingCommand;
use Modules\Booking\Eloquent\Resolvers\Shared\BookingLifecycleEloquentResolver;
use Modules\Booking\ValuesObjects\CancelBookingResult;

final class CancelBookingEloquentResolver
{
    public function __construct(private readonly BookingLifecycleEloquentResolver $lifecycle) {}

    public function resolve(CancelBookingCommand $command): CancelBookingResult
    {
        return $this->lifecycle->cancelForClient($command);
    }
}
