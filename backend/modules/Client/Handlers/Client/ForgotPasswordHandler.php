<?php

declare(strict_types=1);

namespace Modules\Client\Handlers\Client;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Modules\Client\CQRS\Command\Client\ForgotPasswordCommand;
use Modules\Client\Mail\SendPasswordResetCode;
use Modules\Client\Repositories\ForgotPasswordEloquentResolver;
use Modules\Client\Services\PasswordResetCodeVerifier;
use Modules\Client\ValuesObjects\ForgotPasswordResult;

final class ForgotPasswordHandler
{
    public function __construct(
        private readonly ForgotPasswordEloquentResolver $resolver,
        private readonly PasswordResetCodeVerifier $codes,
    ) {}

    public function handle(ForgotPasswordCommand $command): ForgotPasswordResult
    {
        $client = $this->resolver->findByEmail($command->email);

        if ($client === null) {
            return ForgotPasswordResult::success();
        }

        $code = (string) random_int(100000, 999999);

        // DEVELOPMENT ONLY. Lets local testing read the code without opening
        // Mailtrap. Gated on the `local` environment so staging and production
        // never reach it, and never a substitute for real delivery testing.
        if (app()->environment('local')) {
            Log::debug('Development OTP generated', [
                'type' => 'password_reset',
                'client_id' => $client->id,
                'otp' => $code,
            ]);
        }

        $this->codes->issue((string) $client->id, $code);

        Mail::to($client->email)->send(new SendPasswordResetCode($code));

        return ForgotPasswordResult::success();
    }
}
