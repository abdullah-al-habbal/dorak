<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Branches;

use Modules\Branch\Models\BranchModel;

final class StoreBranchEloquentResolver
{
    public function resolve(array $attributes): BranchModel
    {
        return BranchModel::query()->create($attributes);
    }
}
