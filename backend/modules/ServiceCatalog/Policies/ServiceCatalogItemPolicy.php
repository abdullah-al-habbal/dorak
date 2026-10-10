<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Policies;

use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Client\Models\ClientModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

final class ServiceCatalogItemPolicy
{
    public function create(BranchModel|AdminModel|ClientModel $actor): bool
    {
        return $actor instanceof BranchModel || $actor instanceof AdminModel;
    }

    public function update(BranchModel|AdminModel|ClientModel $actor, ServiceCatalogItemModel $item): bool
    {
        return $this->create($actor);
    }

    public function delete(BranchModel|AdminModel|ClientModel $actor, ServiceCatalogItemModel $item): bool
    {
        return $this->create($actor);
    }
}
