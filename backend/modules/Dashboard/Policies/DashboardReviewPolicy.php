<?php

declare(strict_types=1);

namespace Modules\Dashboard\Policies;

use Modules\Dashboard\Support\DashboardActor;

/** Client reviews and review disputes are filed by the branch side; the platform admin only moderates them. */
final class DashboardReviewPolicy
{
    public function file(DashboardActor $actor): bool
    {
        return ! $actor->isPlatformAdmin();
    }
}
