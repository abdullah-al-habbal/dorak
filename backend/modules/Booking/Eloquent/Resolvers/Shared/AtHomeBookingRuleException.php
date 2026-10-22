<?php

declare(strict_types=1);

namespace Modules\Booking\Eloquent\Resolvers\Shared;

use RuntimeException;

final class AtHomeBookingRuleException extends RuntimeException
{
    public function __construct(public readonly string $errorCode)
    {
        parent::__construct(__('booking::messages.'.$errorCode));
    }
}
