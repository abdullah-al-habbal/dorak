<?php

declare(strict_types=1);

namespace Modules\Client\Repositories;

use Modules\Client\Models\ClientModel;
use Modules\Core\Services\DeviceTokenService;

final class LogoutEloquentResolver
{
    public function __construct(
        private readonly DeviceTokenService $deviceTokens,
    ) {}

    public function deleteCurrentToken(ClientModel $client): void
    {
        $accessToken = $client->currentAccessToken();
        $this->deviceTokens->revokeForAccessToken($accessToken->getKey());
        $accessToken->delete();
    }
}
