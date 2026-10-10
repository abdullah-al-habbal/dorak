<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Branches;

use Modules\Branch\Models\BranchModel;

final class UpdateBranchEloquentResolver
{
    public function resolve(BranchModel $branch, array $attributes): BranchModel
    {
        $branch->update($attributes);

        return $branch->fresh();
    }
}
