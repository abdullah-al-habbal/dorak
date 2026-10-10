<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Chairs;

use Modules\Chair\Models\ChairModel;

final class UpdateChairEloquentResolver
{
    /** @param array<string, mixed> $attributes */
    public function resolve(ChairModel $chair, array $attributes): ChairModel
    {
        $chair->update($attributes);

        return $chair->refresh()->load('barber');
    }
}
