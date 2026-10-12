<?php

declare(strict_types=1);

namespace Modules\Ban\Http\Responses;

use Illuminate\Http\JsonResponse;

final class AccountBannedResponse
{
    public static function make(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'statusCode' => 403,
            'code' => 'ACCOUNT_BANNED',
            'message' => __('ban::ui.account_banned'),
            'timestamp' => now()->toISOString(),
        ], 403);
    }
}
