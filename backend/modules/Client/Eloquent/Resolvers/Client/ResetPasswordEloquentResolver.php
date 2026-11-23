<?php

declare(strict_types=1);

namespace Modules\Client\Eloquent\Resolvers\Client;

use Modules\Client\Models\ClientModel;
use Modules\Core\Services\DeviceTokenService;

final class ResetPasswordEloquentResolver
{
    public function __construct(
        private readonly DeviceTokenService $deviceTokens,
    ) {}

    public function findByEmail(string $email): ?ClientModel
    {
        return ClientModel::where('email', $email)->first();
    }

    public function updatePassword(ClientModel $client, string $hashedPassword): void
    {
        $client->update(['password' => $hashedPassword]);
    }

    public function deleteTokens(ClientModel $client): void
    {
        $client->tokens()->delete();
        $this->deviceTokens->revokeAllForAccount($client);
    }
}
