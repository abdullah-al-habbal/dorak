<?php

declare(strict_types=1);

namespace Modules\Booking\Eloquent\Resolvers\Shared;

final class InvalidBookingServicesException extends \RuntimeException
{
    public function __construct(string $messageKey = 'booking::messages.invalid_booking_services')
    {
        parent::__construct(__($messageKey));
    }
}
