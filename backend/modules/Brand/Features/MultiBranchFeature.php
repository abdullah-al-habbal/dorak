<?php

declare(strict_types=1);

namespace Modules\Brand\Features;

use Laravel\Pennant\Attributes\Name;
use Modules\Brand\Models\BrandModel;

/** A3/I2: a brand may run a second (and further) branch only with this premium flag. */
#[Name('multi-branch')]
final class MultiBranchFeature
{
    public function resolve(BrandModel $brand): bool
    {
        return false;
    }
}
