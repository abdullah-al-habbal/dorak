<?php

declare(strict_types=1);

namespace Modules\Client\Handlers\Client;

use Illuminate\Support\Facades\Log;
use Modules\Client\CQRS\Command\Client\RequestPhoneOtpCommand;
use Modules\Client\Eloquent\Resolvers\Client\PhoneOtpEloquentResolver;
use Modules\Client\Services\ClientPhoneOtpCodes;
use Modules\Client\ValuesObjects\RequestPhoneOtpResult;
use Modules\Core\Contracts\SmsSender;
use Modules\Core\Exceptions\SmsDeliveryException;

final class RequestPhoneOtpHandler
{
    public function __construct(
        private readonly PhoneOtpEloquentResolver $resolver,
        private readonly SmsSender $sms,
        private readonly ClientPhoneOtpCodes $codes,
    ) {}

    public function handle(RequestPhoneOtpCommand $command): RequestPhoneOtpResult
    {
        if ($this->resolver->phoneVerifiedByAnotherClient($command->clientId, $command->phone)) {
            return RequestPhoneOtpResult::phoneInUse();
        }

        $code = (string) random_int(100000, 999999);

        $this->codes->issue($command->clientId, $command->phone, $code);

        try {
            $this->sms->send($command->phone, __('client::messages.phone_otp_sms', ['code' => $code]));
        } catch (SmsDeliveryException $exception) {
            Log::warning('Phone OTP SMS delivery failed.', [
                'client_id' => $command->clientId,
                'reason' => $exception->getMessage(),
            ]);
            $this->codes->discard($command->clientId);

            return RequestPhoneOtpResult::deliveryFailed();
        }

        return RequestPhoneOtpResult::sent();
    }
}
