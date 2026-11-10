<?php

declare(strict_types=1);

namespace Modules\Admin\Exceptions;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/** NS-04: a change that would leave the platform without a working administrator. Renders a stable 409 error. */
final class AdminUserGuardException extends RuntimeException
{
    public const string CODE_SELF_DEACTIVATION = 'admin_self_deactivation';

    public const string CODE_LAST_ACTIVE = 'admin_last_active';

    private function __construct(private readonly string $errorCode, string $message)
    {
        parent::__construct($message);
    }

    public static function selfDeactivation(): self
    {
        return new self(self::CODE_SELF_DEACTIVATION, __('admin::messages.cannot_deactivate_self'));
    }

    public static function lastActiveAdmin(): self
    {
        return new self(self::CODE_LAST_ACTIVE, __('admin::messages.cannot_deactivate_last'));
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
