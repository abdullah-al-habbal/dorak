<?php

declare(strict_types=1);

namespace Modules\Dashboard\Policies;

use Modules\Dashboard\Support\DashboardActor;

/**
 * Service categories are global and shared by every brand, so only the platform admin creates them
 * (F-02, decision B). Owners and managers pick from the list; there is no tenant request flow.
 */
final class DashboardServiceCategoryPolicy
{
    public function create(DashboardActor $actor): bool
    {
        return $actor->isPlatformAdmin();
    }
}
