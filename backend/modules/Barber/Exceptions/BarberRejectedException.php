<?php

declare(strict_types=1);

namespace Modules\Barber\Exceptions;

use RuntimeException;

/** Thrown at login for a rejected barber; carries the admin's reason for the 403 `ACCOUNT_REJECTED` answer. */
final class BarberRejectedException extends RuntimeException
{
    public const string CODE = 'ACCOUNT_REJECTED';

    public function __construct(public readonly string $reason)
    {
        parent::__construct($reason);
    }
}
