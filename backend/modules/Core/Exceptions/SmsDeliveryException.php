<?php

declare(strict_types=1);

namespace Modules\Core\Exceptions;

use RuntimeException;
use Throwable;

/**
 * Raised when an SMS gateway cannot be reached or rejects a message.
 * Messages must never contain the phone number, the SMS body or credentials.
 */
final class SmsDeliveryException extends RuntimeException
{
    public static function unreachable(Throwable $previous): self
    {
        return new self('SMS gateway is unreachable.', 0, $previous);
    }

    public static function rejected(int $status): self
    {
        return new self("SMS gateway rejected the message with HTTP {$status}.");
    }
}
