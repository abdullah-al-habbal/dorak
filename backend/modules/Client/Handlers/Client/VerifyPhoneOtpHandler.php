<?php

declare(strict_types=1);

namespace Modules\Client\Handlers\Client;

use Modules\Client\CQRS\Command\Client\VerifyPhoneOtpCommand;
use Modules\Client\Eloquent\Resolvers\Client\PhoneOtpEloquentResolver;
use Modules\Client\Services\ClientPhoneOtpCodes;
use Modules\Client\ValuesObjects\VerifyPhoneOtpResult;

final class VerifyPhoneOtpHandler
{
    public function __construct(
        private readonly PhoneOtpEloquentResolver $resolver,
        private readonly ClientPhoneOtpCodes $codes,
    ) {}

    public function handle(VerifyPhoneOtpCommand $command): VerifyPhoneOtpResult
    {
        $phone = $this->codes->redeem($command->clientId, $command->code);

        if ($phone === null) {
            return VerifyPhoneOtpResult::invalidCode();
        }

        $client = $this->resolver->markPhoneVerified($command->clientId, $phone);

        if ($client === null) {
            return VerifyPhoneOtpResult::phoneInUse();
        }

        return VerifyPhoneOtpResult::success($client->refresh());
    }
}
