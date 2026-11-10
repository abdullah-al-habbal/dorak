<?php

declare(strict_types=1);

namespace Modules\Branch\Exceptions;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/** A branch switch or suspension the branch's current state does not allow. Renders a stable 409 API error. */
final class BranchLifecycleException extends RuntimeException
{
    public const string CODE_SUSPENDED = 'branch_suspended';

    public const string CODE_LAST_ACTIVE = 'branch_last_active';

    public const string CODE_ALREADY_SUSPENDED = 'branch_already_suspended';

    public const string CODE_NOT_SUSPENDED = 'branch_not_suspended';

    private function __construct(private readonly string $errorCode, string $messageKey)
    {
        parent::__construct(__($messageKey));
    }

    public static function suspended(): self
    {
        return new self(self::CODE_SUSPENDED, 'branch::messages.lifecycle_suspended');
    }

    public static function lastActive(): self
    {
        return new self(self::CODE_LAST_ACTIVE, 'branch::messages.lifecycle_last_active');
    }

    public static function alreadySuspended(): self
    {
        return new self(self::CODE_ALREADY_SUSPENDED, 'branch::messages.lifecycle_already_suspended');
    }

    public static function notSuspended(): self
    {
        return new self(self::CODE_NOT_SUSPENDED, 'branch::messages.lifecycle_not_suspended');
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
