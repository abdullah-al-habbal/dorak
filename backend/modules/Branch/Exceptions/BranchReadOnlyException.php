<?php

declare(strict_types=1);

namespace Modules\Branch\Exceptions;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/** Decision A: a suspended branch can be read but not changed. Renders the stable 403 `branch_read_only` error. */
final class BranchReadOnlyException extends RuntimeException
{
    public const string CODE = 'branch_read_only';

    public function __construct()
    {
        parent::__construct(__('branch::messages.read_only'));
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
