<?php

declare(strict_types=1);

namespace Modules\Branch\Handlers\Branch;

use Modules\Activation\Exceptions\AccountNotActiveException;
use Modules\Branch\Enums\BranchStatusEnum;
use Modules\Branch\Models\BranchModel;

final class RefreshTokenHandler
{
    /**
     * Swaps the current token for a fresh one. Returns the new plain-text token.
     */
    public function handle(BranchModel $branch): string
    {
        if ($branch->getAttribute('status') !== BranchStatusEnum::Enabled) {
            throw new AccountNotActiveException;
        }

        $branch->currentAccessToken()->delete();

        return $branch->createToken('branch-app')->plainTextToken;
    }
}
