<?php

declare(strict_types=1);

namespace Modules\Booking\Eloquent\Resolvers\Shared;

use RuntimeException;

final class ActiveBookingBanException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('A client or barber with an active ban cannot book.');
    }
}
