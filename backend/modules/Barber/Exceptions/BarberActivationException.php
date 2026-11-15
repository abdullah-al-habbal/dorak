<?php

declare(strict_types=1);

namespace Modules\Barber\Exceptions;

use Modules\Core\Exceptions\ConflictApiException;

/** An activation move the barber's current status does not allow. Renders a stable 409 API error. */
final class BarberActivationException extends ConflictApiException
{
    public const string CODE_NOT_ENABLED = 'barber_not_enabled';

    public const string CODE_NOT_DISABLED = 'barber_not_disabled';

    public const string CODE_NOT_APPROVED = 'barber_not_approved';

    private function __construct(private readonly string $errorCode, string $messageKey)
    {
        parent::__construct(__($messageKey));
    }

    public static function notEnabled(): self
    {
        return new self(self::CODE_NOT_ENABLED, 'barber::messages.activation_not_enabled');
    }

    public static function notDisabled(): self
    {
        return new self(self::CODE_NOT_DISABLED, 'barber::messages.activation_not_disabled');
    }

    public static function notApproved(): self
    {
        return new self(self::CODE_NOT_APPROVED, 'barber::messages.activation_not_approved');
    }

    public function errorCode(): string
    {
        return $this->errorCode;
    }
}
