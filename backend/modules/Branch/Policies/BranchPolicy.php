<?php

declare(strict_types=1);

namespace Modules\Branch\Policies;

use Modules\Branch\Models\BranchModel;

final class BranchPolicy
{
    public function manage(BranchModel $manager, BranchModel $branch): bool
    {
        return $manager->is($branch);
    }
}
