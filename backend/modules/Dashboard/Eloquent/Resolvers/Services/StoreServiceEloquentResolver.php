<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Services;

use Modules\OfferedService\Models\OfferedServiceModel;

final class StoreServiceEloquentResolver
{
    /** @param array<string, mixed> $attributes */
    public function resolve(array $attributes): OfferedServiceModel
    {
        return OfferedServiceModel::query()->create($attributes);
    }
}
