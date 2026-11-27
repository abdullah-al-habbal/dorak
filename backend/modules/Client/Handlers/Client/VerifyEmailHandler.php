<?php

declare(strict_types=1);

namespace Modules\Client\Handlers\Client;

use Modules\Client\CQRS\Command\Client\VerifyEmailCommand;
use Modules\Client\Eloquent\Resolvers\Client\VerifyEmailEloquentResolver;
use Modules\Client\Services\ClientEmailVerificationCodes;
use Modules\Client\ValuesObjects\VerifyEmailResult;

final class VerifyEmailHandler
{
    public function __construct(
        private readonly VerifyEmailEloquentResolver $resolver,
        private readonly ClientEmailVerificationCodes $codes,
    ) {}

    public function handle(VerifyEmailCommand $command): VerifyEmailResult
    {
        $client = $this->resolver->findById($command->clientId);

        if ($client === null || $client->email_verified_at !== null) {
            return VerifyEmailResult::alreadyVerified();
        }

        if (! $this->codes->redeem((string) $client->id, $command->code)) {
            return VerifyEmailResult::invalidCode();
        }

        $this->resolver->markAsVerified($client);

        return VerifyEmailResult::success();
    }
}
