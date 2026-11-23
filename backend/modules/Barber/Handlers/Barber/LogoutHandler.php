<?php

declare(strict_types=1);

namespace Modules\Barber\Handlers\Barber;

use Modules\Barber\Models\BarberModel;
use Modules\Core\Services\DeviceTokenService;

final class LogoutHandler
{
    public function __construct(
        private readonly DeviceTokenService $deviceTokens,
    ) {}

    public function handle(BarberModel $barber): void
    {
        $accessToken = $barber->currentAccessToken();
        $this->deviceTokens->revokeForAccessToken($accessToken->getKey());
        $accessToken->delete();
    }
}
