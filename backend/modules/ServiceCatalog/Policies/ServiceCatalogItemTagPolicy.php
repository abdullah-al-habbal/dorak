<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Policies;

use Modules\Admin\Models\AdminModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemTagModel;

/** Tags are platform taxonomy: only an admin writes them. A non-admin or null actor is a denial, not a 500. */
final class ServiceCatalogItemTagPolicy
{
    public function create(mixed $actor): bool
    {
        return $actor instanceof AdminModel;
    }

    public function update(mixed $actor, ServiceCatalogItemTagModel $tag): bool
    {
        return $this->create($actor);
    }

    public function delete(mixed $actor, ServiceCatalogItemTagModel $tag): bool
    {
        return $this->create($actor);
    }
}
