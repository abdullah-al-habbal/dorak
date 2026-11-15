<?php

declare(strict_types=1);

namespace Modules\Client\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Client\Enums\ClientStatusEnum;
use Modules\Client\Models\ClientModel;
use Modules\Core\Enums\AccountAccessScope;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Helpers\ApiResponseTrait;

final class EnsureClientAccountAccess
{
    use ApiResponseTrait;

    public function handle(Request $request, Closure $next, string $scope = AccountAccessScope::Active->value): mixed
    {
        $client = Auth::guard('client')->user();

        if (! $client instanceof ClientModel) {
            return $next($request);
        }

        $status = $client->getAttribute('status');
        $emailVerifiedAt = $client->getAttribute('email_verified_at');
        $active = $status === ClientStatusEnum::Enabled && $emailVerifiedAt !== null;
        $verificationOnly = AccountAccessScope::fromParameter($scope) === AccountAccessScope::Verification
            && in_array($status, [ClientStatusEnum::Pending, ClientStatusEnum::Enabled], true)
            && $emailVerifiedAt === null;

        if (! $active && ! $verificationOnly) {
            return $this->error(ErrorCodeEnum::ACCOUNT_NOT_ACTIVE);
        }

        return $next($request);
    }
}
