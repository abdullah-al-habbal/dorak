<?php

declare(strict_types=1);

namespace Modules\Booking\Eloquent\Resolvers\Shared;

final class InvalidBookingServicesException extends \RuntimeException
{
    public function __construct()
    {
        parent::__construct(__('booking::messages.invalid_services_for_booking'));
    }
}
