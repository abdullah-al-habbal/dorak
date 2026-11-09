<?php

declare(strict_types=1);

namespace Modules\Client\Handlers\Client;

use Illuminate\Contracts\Auth\PasswordBrokerFactory;
use Illuminate\Support\Facades\Hash;
use Modules\Client\CQRS\Command\Client\ResetPasswordCommand;
use Modules\Client\Eloquent\Resolvers\Client\ResetPasswordEloquentResolver;
use Modules\Client\Services\PasswordResetCodeVerifier;
use Modules\Client\ValuesObjects\ResetPasswordResult;
use Modules\Core\Enums\PasswordBrokerEnum;

final class ResetPasswordHandler
{
    public function __construct(
        private readonly ResetPasswordEloquentResolver $resolver,
        private readonly PasswordResetCodeVerifier $codes,
        private readonly PasswordBrokerFactory $brokers,
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
        // A dashboard reset link must not outlive a password set in the app.
        $this->brokers->broker(PasswordBrokerEnum::Clients->value)->deleteToken($client);

        return ResetPasswordResult::success();
    }
}
