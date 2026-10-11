<?php

declare(strict_types=1);

namespace Modules\BarberAffiliation\Policies;

use Modules\Barber\Models\BarberModel;
use Modules\BarberAffiliation\Models\BarberAffiliationModel;

final class BarberAffiliationPolicy
{
    public function view(BarberModel $actor, string $barberId): bool
    {
        return $actor->getKey() === $barberId;
    }

    public function create(BarberModel $actor, string $barberId): bool
    {
        return $this->view($actor, $barberId);
    }

    public function accept(BarberModel $actor, BarberAffiliationModel $affiliation): bool
    {
        return $this->canDecide($actor, $affiliation);
    }

    public function reject(BarberModel $actor, BarberAffiliationModel $affiliation): bool
    {
        return $this->canDecide($actor, $affiliation);
    }

    private function canDecide(BarberModel $actor, BarberAffiliationModel $affiliation): bool
    {
        $initiatedByType = $affiliation->getAttribute('initiated_by_type');
        $initiatedById = $affiliation->getAttribute('initiated_by_id');

        return $affiliation->barber()->is($actor)
            && is_string($initiatedByType)
            && is_string($initiatedById)
            && ! (
                $initiatedByType === BarberModel::class
                && $initiatedById === $actor->getKey()
            );
    }
}
