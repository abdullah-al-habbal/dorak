<?php

declare(strict_types=1);

namespace Modules\Client\Eloquent\Resolvers\Client;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Client\Enums\ClientStatusEnum;
use Modules\Client\Enums\SocialProviderEnum;
use Modules\Client\Models\ClientModel;
use Modules\Client\Models\SocialAccountModel;

final class SocialLoginEloquentResolver
{
    public function findSocialAccount(SocialProviderEnum $provider, string $providerId): ?SocialAccountModel
    {
        return SocialAccountModel::where('provider', $provider)
            ->where('provider_id', $providerId)
            ->first();
    }

    public function findClientByEmail(string $email): ?ClientModel
    {
        return ClientModel::where('email', $email)->first();
    }

    public function createClient(string $name, string $email): ClientModel
    {
        return ClientModel::create([
            'name' => $name,
            'email' => $email,
            'email_verified_at' => now(),
            'password' => Hash::make(Str::random(32)),
            'status' => ClientStatusEnum::Enabled,
        ]);
    }

    public function createSocialAccount(
        ClientModel $client,
        SocialProviderEnum $provider,
        string $providerId,
        ?string $avatar,
    ): SocialAccountModel {
        return SocialAccountModel::create([
            'client_id' => $client->id,
            'provider' => $provider,
            'provider_id' => $providerId,
            'avatar_url' => $avatar,
        ]);
    }
}
