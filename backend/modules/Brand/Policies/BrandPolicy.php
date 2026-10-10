<?php

declare(strict_types=1);

namespace Modules\Brand\Policies;

use Modules\Brand\Models\BrandModel;
use Modules\Client\Models\ClientModel;

final class BrandPolicy
{
    public function manage(ClientModel $owner, BrandModel $brand): bool
    {
        return $brand->getAttribute('owner_id') === $owner->getKey();
    }
}
