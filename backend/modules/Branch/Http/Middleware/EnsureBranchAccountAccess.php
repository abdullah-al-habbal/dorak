<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Branch\Models\BranchModel;

/**
 * Gates branch-token routes on the branch's current status, so a token issued
 * before a branch was deactivated cannot outlive the deactivation. Requests
 * authenticated as any other account type pass through untouched.
 */
final class EnsureBranchAccountAccess
{
    public function handle(Request $request, Closure $next): mixed
    {
        $branch = Auth::guard('branch_api')->user();

        if (! $branch instanceof BranchModel) {
            return $next($request);
        }

        if (! $branch->isOperational()) {
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
