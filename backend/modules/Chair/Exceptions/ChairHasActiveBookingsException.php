<?php

declare(strict_types=1);

namespace Modules\Chair\Exceptions;

use RuntimeException;

final class ChairHasActiveBookingsException extends RuntimeException
{
    /** @param list<string> $bookingIds */
    public function __construct(public readonly array $bookingIds)
    {
        parent::__construct('Chair has active or future bookings.');
    }
}
