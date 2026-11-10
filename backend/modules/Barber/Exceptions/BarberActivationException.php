<?php

declare(strict_types=1);

namespace Modules\Barber\Exceptions;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/** An activation move the barber's current status does not allow. Renders a stable 409 API error. */
final class BarberActivationException extends RuntimeException
{
    public const string CODE_NOT_ENABLED = 'barber_not_enabled';

    public const string CODE_NOT_DISABLED = 'barber_not_disabled';

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

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'statusCode' => 409,
            'code' => $this->errorCode,
            'message' => $this->getMessage(),
            'timestamp' => now()->toIso8601String(),
        ], 409);
    }
}
