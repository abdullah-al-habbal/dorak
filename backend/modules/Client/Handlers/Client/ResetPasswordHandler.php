<?php

declare(strict_types=1);

namespace Modules\Client\Handlers\Client;

use Illuminate\Support\Facades\Hash;
use Modules\Client\CQRS\Command\Client\ResetPasswordCommand;
use Modules\Client\Eloquent\Resolvers\Client\ResetPasswordEloquentResolver;
use Modules\Client\Services\PasswordResetCodeVerifier;
use Modules\Client\ValuesObjects\ResetPasswordResult;

final class ResetPasswordHandler
{
    public function __construct(
        private readonly ResetPasswordEloquentResolver $resolver,
        private readonly PasswordResetCodeVerifier $codes,
    ) {}

    public function handle(ResetPasswordCommand $command): ResetPasswordResult
    {
        $client = $this->resolver->findByEmail($command->email);
        $clientId = (string) $client->id;

        if (! $this->codes->verify($clientId, $command->code)) {
            return ResetPasswordResult::invalidCode();
        }

        $this->codes->consume($clientId);

        $this->resolver->updatePassword($client, Hash::make($command->password));
        $this->resolver->deleteTokens($client);

        return ResetPasswordResult::success();
    }
}
