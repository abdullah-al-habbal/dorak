<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Policies;

use Modules\Admin\Models\AdminModel;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;

/**
 * The global taxonomy is platform data: only an admin (Filament or the `admin_api` dashboard
 * session) writes it. Actors are `mixed` so a non-admin or null actor is a denial, not a 500.
 */
final class ServiceCatalogCategoryPolicy
{
    public function create(mixed $actor): bool
    {
        return $actor instanceof AdminModel;
    }

    public function update(mixed $actor, ServiceCatalogCategoryModel $category): bool
    {
        return $this->create($actor);
    }

    public function delete(mixed $actor, ServiceCatalogCategoryModel $category): bool
    {
        return $this->create($actor);
    }
}
