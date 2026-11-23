<?php

declare(strict_types=1);

namespace Modules\Branch\Handlers\Branch;

use Modules\Branch\Models\BranchModel;
use Modules\Core\Services\DeviceTokenService;

final class LogoutHandler
{
    public function __construct(
        private readonly DeviceTokenService $deviceTokens,
    ) {}

    public function handle(BranchModel $branch): void
    {
        $accessToken = $branch->currentAccessToken();
        $this->deviceTokens->revokeForAccessToken($accessToken->getKey());
        $accessToken->delete();
    }
}
