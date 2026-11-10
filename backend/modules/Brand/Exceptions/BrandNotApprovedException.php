<?php

declare(strict_types=1);

namespace Modules\Brand\Exceptions;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/** D11: a brand still waiting for approval may not do this yet. Renders the stable 403 `brand_not_approved` API error. */
final class BrandNotApprovedException extends RuntimeException
{
    public const string CODE = 'brand_not_approved';

    public function __construct()
    {
        parent::__construct(__('brand::messages.brand_not_approved'));
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
