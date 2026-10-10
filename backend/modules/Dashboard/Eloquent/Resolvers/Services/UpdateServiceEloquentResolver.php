<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Services;

use Modules\OfferedService\Models\OfferedServiceModel;

final class UpdateServiceEloquentResolver
{
    /** @param array<string, mixed> $attributes */
    public function resolve(OfferedServiceModel $service, array $attributes): OfferedServiceModel
    {
        $service->update($attributes);

        return $service->refresh();
    }
}
