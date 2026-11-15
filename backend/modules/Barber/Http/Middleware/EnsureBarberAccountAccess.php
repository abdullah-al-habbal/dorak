<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Barber\Enums\BarberStatusEnum;
use Modules\Barber\Models\BarberModel;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;
use Modules\Core\Enums\AccountAccessScope;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Helpers\ApiResponseTrait;

/**
 * Gates barber-token routes on the barber's current status, so a token issued
 * before a status change cannot outlive it.
 *
 * - `active` (default): only enabled barbers — every operational route. A
 *   branch-managed barber is also blocked while the managing branch is disabled.
 * - `onboarding`: pending or enabled — profile read and email verification,
 *   reachable with the token a self-registered (pending) barber receives.
 * - `approved`: anything but pending or rejected — self activation/deactivation, so a
 *   barber awaiting admin approval cannot activate themselves.
 */
final class EnsureBarberAccountAccess
{
    use ApiResponseTrait;

    public function handle(Request $request, Closure $next, string $scope = AccountAccessScope::Active->value): mixed
    {
        $barber = Auth::guard('barber')->user();

        if (! $barber instanceof BarberModel) {
            return $next($request);
        }

        $status = $barber->getAttribute('status');

        $allowed = match (AccountAccessScope::fromParameter($scope)) {
            AccountAccessScope::Onboarding => in_array($status, [BarberStatusEnum::Pending, BarberStatusEnum::Enabled], true),
            AccountAccessScope::Approved => ! in_array($status, [BarberStatusEnum::Pending, BarberStatusEnum::Rejected], true),
            default => $status === BarberStatusEnum::Enabled && ! $this->managingBranchDisabled($barber),
        };

        if (! $allowed) {
            return $this->error(ErrorCodeEnum::ACCOUNT_NOT_ACTIVE);
        }

        return $next($request);
    }

    private function managingBranchDisabled(BarberModel $barber): bool
    {
        $branchId = $barber->getAttribute('managed_by_branch_id');

        return $branchId !== null
            && BranchModel::query()
                ->whereKey($branchId)
                ->where('status', BranchStatusEnum::Disabled->value)
                ->exists();
    }
}
