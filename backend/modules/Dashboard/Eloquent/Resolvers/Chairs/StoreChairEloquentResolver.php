<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Chairs;

use Modules\Chair\Models\ChairModel;

final class StoreChairEloquentResolver
{
    /** @param array<string, mixed> $attributes */
    public function resolve(array $attributes): ChairModel
    {
        return ChairModel::query()->create($attributes)->load('barber');
    }
}
