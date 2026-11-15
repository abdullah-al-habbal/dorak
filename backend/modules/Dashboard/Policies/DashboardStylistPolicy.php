<?php

declare(strict_types=1);

namespace Modules\Dashboard\Policies;

use Modules\Barber\Models\BarberModel;
use Modules\Dashboard\Support\DashboardActor;

/**
 * Who may manage a branch stylist from the dashboard. A stylist belongs to the branches whose chairs they
 * sit on, so the platform admin and anyone with access to one of those branches may change them. Creating
 * a stylist is open to the actors that run branches; the chair they are assigned to is still checked
 * against the actor's branches by the store handler.
 */
final class DashboardStylistPolicy
{
    public function create(DashboardActor $actor): bool
    {
        return ! $actor->isBarber();
    }

    public function manage(DashboardActor $actor, BarberModel $stylist): bool
    {
        $scope = $actor->scopedBranchIds();

        return $scope === null || $stylist->chairs()->whereIn('branch_id', $scope)->exists();
    }
}
