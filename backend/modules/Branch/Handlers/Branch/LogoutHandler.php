<?php

declare(strict_types=1);

namespace Modules\Branch\Handlers\Branch;

use Modules\Branch\Models\BranchModel;

final class LogoutHandler
{
    public function handle(BranchModel $branch): void
    {
        $branch->currentAccessToken()->delete();
    }
}
