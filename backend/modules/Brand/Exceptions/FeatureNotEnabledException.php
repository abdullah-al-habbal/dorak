<?php

declare(strict_types=1);

namespace Modules\Brand\Exceptions;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * A premium brand feature is off (I2) or a branch is locked after a downgrade
 * (I3/EC-6). Renders the stable 403 `feature_not_enabled` API error.
 */
final class FeatureNotEnabledException extends RuntimeException
{
    public function __construct(public readonly string $feature)
    {
        parent::__construct(__('brand::messages.feature_not_enabled', ['feature' => $feature]));
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'statusCode' => 403,
            'code' => 'feature_not_enabled',
            'message' => $this->getMessage(),
            'errors' => ['feature' => [$this->feature]],
            'timestamp' => now()->toIso8601String(),
        ], 403);
    }
}
