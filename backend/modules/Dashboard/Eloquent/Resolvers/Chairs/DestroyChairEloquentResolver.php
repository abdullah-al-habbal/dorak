<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\Chairs;

use Modules\Chair\Models\ChairModel;

final class DestroyChairEloquentResolver
{
    public function resolve(ChairModel $chair): void
    {
        $chair->delete();
    }
}
