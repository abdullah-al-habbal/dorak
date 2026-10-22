<?php

declare(strict_types=1);

namespace Modules\Client\Handlers\Client;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Modules\Client\CQRS\Command\Client\VerifyPhoneOtpCommand;
use Modules\Client\Eloquent\Resolvers\Client\PhoneOtpEloquentResolver;
use Modules\Client\ValuesObjects\VerifyPhoneOtpResult;

final class VerifyPhoneOtpHandler
{
    private const MAX_ATTEMPTS = 5;

    public function __construct(
        private readonly PhoneOtpEloquentResolver $resolver,
    ) {}

    public function handle(VerifyPhoneOtpCommand $command): VerifyPhoneOtpResult
    {
        $pending = Cache::get("phone_otp_{$command->clientId}");

        if (! is_array($pending) || ! Hash::check($command->code, (string) $pending['code_hash'])) {
            $this->registerFailedAttempt($command->clientId);

            return VerifyPhoneOtpResult::invalidCode();
        }

        $client = $this->resolver->markPhoneVerified($command->clientId, (string) $pending['phone']);

        if ($client === null) {
            return VerifyPhoneOtpResult::phoneInUse();
        }

        Cache::forget("phone_otp_{$command->clientId}");
        Cache::forget("phone_otp_attempts_{$command->clientId}");

        return VerifyPhoneOtpResult::success($client->refresh());
    }

    private function registerFailedAttempt(string $clientId): void
    {
        $key = "phone_otp_attempts_{$clientId}";

        $attempts = Cache::increment($key, 1);

        if ($attempts === false) {
            Cache::add($key, 1, now()->addMinutes(10));

            $attempts = 1;
        }

        if ($attempts >= self::MAX_ATTEMPTS) {
            Cache::forget("phone_otp_{$clientId}");
        }
    }
}
