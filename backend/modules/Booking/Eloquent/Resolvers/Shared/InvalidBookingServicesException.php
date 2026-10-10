<?php

declare(strict_types=1);

namespace Modules\Booking\Eloquent\Resolvers\Shared;

final class InvalidBookingServicesException extends \RuntimeException
{
    public function __construct()
    {
        parent::__construct('Booking services must be active and have a duration.');
    }
}
