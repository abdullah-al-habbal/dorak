<?php

declare(strict_types=1);

namespace Modules\Client\Handlers\Client;

use Illuminate\Support\Facades\Hash;
use Modules\Activation\Exceptions\AccountNotActiveException;
use Modules\Ban\Exceptions\AccountBannedException;
use Modules\Client\CQRS\Command\Client\LoginCommand;
use Modules\Client\Enums\ClientStatusEnum;
use Modules\Client\Repositories\LoginEloquentResolver;
use Modules\Client\ValuesObjects\LoginResult;

final class LoginHandler
{
    public function __construct(
        private readonly LoginEloquentResolver $resolver,
    ) {}

    public function handle(LoginCommand $command): LoginResult
    {
        $client = $this->resolver->findByEmail($command->email);

        if ($client === null || ! Hash::check($command->password, $client->password)) {
            return LoginResult::invalidCredentials();
        }

        if ($client->isBanned()) {
            throw new AccountBannedException;
        }

        if ($client->getAttribute('status') === ClientStatusEnum::Disabled
            || ($client->getAttribute('status') === ClientStatusEnum::Pending && $client->getAttribute('email_verified_at') !== null)) {
            throw new AccountNotActiveException;
        }

        $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

        return LoginResult::success(
            token: $token,
            clientData: $client->authPayload(),
        );
    }
}
