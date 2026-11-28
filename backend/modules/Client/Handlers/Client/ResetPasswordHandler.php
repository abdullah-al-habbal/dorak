<?php

declare(strict_types=1);

namespace Modules\Client\Handlers\Client;

use Illuminate\Support\Facades\Hash;
use Modules\Client\CQRS\Command\Client\ResetPasswordCommand;
use Modules\Client\Eloquent\Resolvers\Client\ResetPasswordEloquentResolver;
use Modules\Client\Services\PasswordResetCodeVerifier;
use Modules\Client\ValuesObjects\ResetPasswordResult;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;
use Modules\Dashboard\Services\AccountPasswordReplacement;

final class ResetPasswordHandler
{
    public function __construct(
        private readonly ResetPasswordEloquentResolver $resolver,
        private readonly PasswordResetCodeVerifier $codes,
        private readonly AccountPasswordReplacement $passwords,
    ) {}

    public function handle(ResetPasswordCommand $command): ResetPasswordResult
    {
        $client = $this->resolver->findByEmail($command->email);
        $clientId = $client === null ? null : (string) $client->id;

        // An unknown email fails exactly like a wrong code.
        if (! $this->codes->redeem($clientId, $command->code) || $client === null) {
            return ResetPasswordResult::invalidCode();
        }

        // No token, dashboard session or dashboard reset link outlives a password set in the app (BG-60).
        $this->passwords->replace(DashboardActorTypeEnum::Owner, $client, Hash::make($command->password));

        return ResetPasswordResult::success();
    }
}
