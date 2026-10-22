<?php

declare(strict_types=1);

namespace Modules\Client\Handlers\Client;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Modules\Client\CQRS\Command\Client\RequestPhoneOtpCommand;
use Modules\Client\Eloquent\Resolvers\Client\PhoneOtpEloquentResolver;
use Modules\Client\ValuesObjects\RequestPhoneOtpResult;
use Modules\Core\Contracts\SmsSender;

final class RequestPhoneOtpHandler
{
    public function __construct(
        private readonly PhoneOtpEloquentResolver $resolver,
        private readonly SmsSender $sms,
    ) {}

    public function handle(RequestPhoneOtpCommand $command): RequestPhoneOtpResult
    {
        if ($this->resolver->phoneVerifiedByAnotherClient($command->clientId, $command->phone)) {
            return RequestPhoneOtpResult::phoneInUse();
        }

        $code = (string) random_int(100000, 999999);

        Cache::put("phone_otp_{$command->clientId}", [
            'phone' => $command->phone,
            'code_hash' => Hash::make($code),
        ], now()->addMinutes(10));
        Cache::forget("phone_otp_attempts_{$command->clientId}");

        $this->sms->send($command->phone, __('client::messages.phone_otp_sms', ['code' => $code]));

        return RequestPhoneOtpResult::sent();
    }
}
