<?php

declare(strict_types=1);

namespace Modules\Chair\Policies;

use Modules\Admin\Models\AdminModel;
use Modules\Branch\Models\BranchModel;
use Modules\Chair\Models\ChairModel;

final class ChairPolicy
{
    public function update(BranchModel|AdminModel $actor, ChairModel $chair): bool
    {
        if ($actor instanceof AdminModel) {
            return true;
        }

        return $chair->branch()->is($actor);
    }
}
