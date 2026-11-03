<?php

declare(strict_types=1);

namespace Modules\Dashboard\Policies;

use Modules\Barber\Services\BarberBranchMembership;
use Modules\Dashboard\Support\DashboardActor;

/**
 * Who may set a brand's price and duration for a barber's services (Gap G6):
 * platform admins, and the brand's owner when the barber works for that brand.
 * Branch managers and barbers never override.
 */
final class BarberServiceOverridePolicy
{
    public function __construct(private readonly BarberBranchMembership $membership) {}

    public function manage(DashboardActor $actor, string $barberId, string $brandId): bool
    {
        if ($actor->isPlatformAdmin()) {
            return true;
        }

        return $actor->isBrandOwner()
            && $actor->canManageBrand($brandId)
            && $this->membership->belongsToBrand($barberId, $brandId);
    }
}
