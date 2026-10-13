<?php

declare(strict_types=1);

namespace Modules\Client\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Client\Enums\ClientStatusEnum;
use Modules\Client\Models\ClientModel;

final class EnsureClientAccountAccess
{
    public function handle(Request $request, Closure $next, string $scope = 'active'): mixed
    {
        $client = Auth::guard('client')->user();

        if (! $client instanceof ClientModel) {
            return $next($request);
        }

        $status = $client->getAttribute('status');
        $emailVerifiedAt = $client->getAttribute('email_verified_at');
        $active = $status === ClientStatusEnum::Enabled && $emailVerifiedAt !== null;
        $verificationOnly = $scope === 'verification'
            && in_array($status, [ClientStatusEnum::Pending, ClientStatusEnum::Enabled], true)
            && $emailVerifiedAt === null;

        if (! $active && ! $verificationOnly) {
            return response()->json([
                'success' => false,
                'statusCode' => 403,
                'code' => 'ACCOUNT_NOT_ACTIVE',
                'message' => trans('activation::messages.account_not_active'),
                'timestamp' => now()->toIso8601String(),
            ], 403);
        }

        return $next($request);
    }
}
