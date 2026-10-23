<?php

declare(strict_types=1);

namespace Modules\Brand\Features;

use Laravel\Pennant\Attributes\Name;
use Modules\Brand\Models\BrandModel;

/** G1/I2: a brand's branches may post jobs only with this premium flag. */
#[Name('job-board')]
final class JobBoardFeature
{
    public function resolve(BrandModel $brand): bool
    {
        return false;
    }
}
