<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Services;

use Modules\OfferedService\Models\OfferedServiceModel;

final class DestroyServiceEloquentResolver
{
    public function resolve(OfferedServiceModel $service): void
    {
        $service->delete();
    }
}
