<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Branches;

use Modules\Branch\Models\BranchModel;

final class DestroyBranchEloquentResolver
{
    public function resolve(BranchModel $branch): void
    {
        $branch->delete();
    }
}
