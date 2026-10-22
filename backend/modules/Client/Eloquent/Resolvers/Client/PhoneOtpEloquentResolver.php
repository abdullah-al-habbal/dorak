<?php

declare(strict_types=1);

namespace Modules\Client\Eloquent\Resolvers\Client;

use Illuminate\Support\Facades\DB;
use Modules\Client\Models\ClientModel;

final class PhoneOtpEloquentResolver
{
    public function phoneVerifiedByAnotherClient(string $clientId, string $phone): bool
    {
        return ClientModel::query()
            ->where('phone', $phone)
            ->whereNotNull('phone_verified_at')
            ->where('id', '!=', $clientId)
            ->exists();
    }

    public function markPhoneVerified(string $clientId, string $phone): ?ClientModel
    {
        return DB::transaction(function () use ($clientId, $phone): ?ClientModel {
            $client = ClientModel::query()->whereKey($clientId)->lockForUpdate()->first();

            if ($client === null || $this->phoneVerifiedByAnotherClient($clientId, $phone)) {
                return null;
            }

            $client->update([
                'phone' => $phone,
                'phone_verified_at' => now(),
            ]);

            return $client;
        });
    }
}
