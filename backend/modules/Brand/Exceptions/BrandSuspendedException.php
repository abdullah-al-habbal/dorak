<?php

declare(strict_types=1);

namespace Modules\Brand\Exceptions;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/** D8: a suspended brand can sign in and read, but may not create or change anything. Renders the stable 403 `brand_suspended` error. */
final class BrandSuspendedException extends RuntimeException
{
    public const string CODE = 'brand_suspended';

    public function __construct()
    {
        parent::__construct(__('brand::messages.brand_suspended'));
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
