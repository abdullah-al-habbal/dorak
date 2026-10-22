<?php

declare(strict_types=1);

namespace Modules\Client\Handlers\Client;

use Modules\Ban\Exceptions\AccountBannedException;
use Modules\Client\Models\ClientModel;
use Modules\Client\Repositories\RefreshTokenEloquentResolver;
use Modules\Client\ValuesObjects\RefreshTokenResult;

final class RefreshTokenHandler
{
    public function __construct(
        private readonly RefreshTokenEloquentResolver $resolver,
    ) {}

    public function handle(ClientModel $client): RefreshTokenResult
    {
        if ($client->isBanned()) {
            throw new AccountBannedException;
        }

        $this->resolver->deleteCurrentToken($client);

        $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

        return RefreshTokenResult::success($token);
    }
}
