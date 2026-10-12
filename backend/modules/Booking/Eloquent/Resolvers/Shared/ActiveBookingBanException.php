<?php

declare(strict_types=1);

namespace Modules\Booking\Eloquent\Resolvers\Shared;

use RuntimeException;

final class ActiveBookingBanException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct(__('booking::messages.active_booking_ban'));
    }
}
