<?php

declare(strict_types=1);

namespace Modules\Brand\Policies;

use Modules\Admin\Models\AdminModel;
use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;
use Modules\Dashboard\Support\DashboardActor;

/**
 * Actors are `mixed` on purpose: the Gate calls these methods with an `AdminModel` (Filament,
 * `admin_api`), a `DashboardActor` or null, and a narrower type would turn a denial into a 500.
 */
final class BrandPolicy
{
    public function manage(ClientModel $owner, BrandModel $brand): bool
    {
        return $brand->getAttribute('owner_id') === $owner->getKey();
    }

    /** Listing brands: platform admins (Filament or dashboard) and brand owners, whose list stays scoped to their brands. */
    public function viewAny(mixed $actor): bool
    {
        if ($actor instanceof AdminModel) {
            return true;
        }

        return $actor instanceof DashboardActor && ($actor->isPlatformAdmin() || $actor->isBrandOwner());
    }

    /** G2: only a platform admin activates a pending brand. */
    public function approve(mixed $actor, BrandModel $brand): bool
    {
        return $actor instanceof AdminModel;
    }
}
