<?php

declare(strict_types=1);

namespace Modules\Client\Handlers\Client;

use Modules\Ban\Exceptions\AccountBannedException;
use Modules\Client\CQRS\Command\Client\RegisterCommand;
use Modules\Client\Eloquent\Resolvers\Client\RegisterEloquentResolver;
use Modules\Client\Http\Resources\Client\ClientProfileResource;
use Modules\Client\Jobs\SendEmailVerificationCodeJob;
use Modules\Client\Models\ClientModel;
use Modules\Client\ValuesObjects\RegisterResult;
use Throwable;

final class RegisterHandler
{
    public function __construct(
        private readonly RegisterEloquentResolver $resolver,
    ) {}

    public function handle(RegisterCommand $command): RegisterResult
    {
        $existingClient = ClientModel::query()->where('email', $command->email)->first();

        if ($existingClient instanceof ClientModel && $existingClient->isBanned()) {
            throw new AccountBannedException;
        }

        $client = $this->resolver->resolve($command);

        $token = $client->createToken('client-app', $client->accessTokenAbilities())->plainTextToken;

        try {
            SendEmailVerificationCodeJob::dispatch((string) $client->id)->afterCommit();
        } catch (Throwable $e) {
            report($e);
        }

        return RegisterResult::success(
            $token,
            ClientProfileResource::make($client->refresh())->resolve(),
        );
    }
}
