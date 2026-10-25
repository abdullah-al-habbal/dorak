<?php

declare(strict_types=1);

namespace Modules\Activation\Policies;

use Modules\Barber\Models\BarberModel;
use Modules\Barber\Services\BarberBranchMembership;
use Modules\Branch\Models\BranchModel;

final class BranchBarberActivationPolicy
{
    public function __construct(private readonly BarberBranchMembership $membership) {}

    public function manage(BranchModel $branch, BarberModel $barber): bool
    {
        return $this->membership->belongsTo($barber->getKey(), $branch);
    }
}
