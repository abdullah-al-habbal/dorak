<?php

declare(strict_types=1);

namespace Modules\Client\Eloquent\Resolvers\Client;

use Modules\Client\Enums\ClientStatusEnum;
use Modules\Client\Models\ClientModel;

final class VerifyEmailEloquentResolver
{
    public function findById(string $clientId): ?ClientModel
    {
        return ClientModel::find($clientId);
    }

    public function markAsVerified(ClientModel $client): void
    {
        $client->update([
            'email_verified_at' => now(),
            'status' => $client->getAttribute('status') === ClientStatusEnum::Pending
                ? ClientStatusEnum::Enabled
                : $client->getAttribute('status'),
        ]);

        $client->tokens()->get()->each(function ($token) use ($client): void {
            if ($token->can('email-verification')) {
                $token->forceFill(['abilities' => $client->accessTokenAbilities()]);
                $token->save();
            }
        });
    }
}
