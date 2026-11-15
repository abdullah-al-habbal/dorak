<?php

declare(strict_types=1);

namespace Modules\Branch\Exceptions;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/** Decision A, point 4: a Disabled branch takes no walk-ins. Renders the stable 403 `branch_not_operational` error. */
final class BranchNotOperationalException extends RuntimeException
{
    public const string CODE = 'branch_not_operational';

    public function __construct()
    {
        parent::__construct(__('branch::messages.not_operational'));
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'statusCode' => 403,
            'code' => self::CODE,
            'message' => $this->getMessage(),
            'timestamp' => now()->toIso8601String(),
        ], 403);
    }
}
