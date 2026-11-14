<?php

declare(strict_types=1);

namespace Modules\Dashboard\Policies;

use Modules\Dashboard\Support\DashboardActor;
use Modules\OfferedService\Enums\ServiceableTypeEnum;

/**
 * Who may create or change an offered service from the dashboard: the platform
 * admin for any owner, and a brand owner only for services of a brand they manage.
 */
final class DashboardServicePolicy
{
    public function write(DashboardActor $actor, mixed $serviceableType, mixed $serviceableId): bool
    {
        if ($actor->isPlatformAdmin()) {
            return true;
        }

        return $serviceableType === ServiceableTypeEnum::Brand->value
            && $actor->canManageBrandServices($serviceableId);
    }
}
