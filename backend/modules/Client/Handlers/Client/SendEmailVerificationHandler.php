<?php

declare(strict_types=1);

namespace Modules\Client\Handlers\Client;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Modules\Client\Mail\SendEmailVerificationCode;
use Modules\Client\Models\ClientModel;
use Modules\Client\Repositories\SendEmailVerificationEloquentResolver;
use Modules\Client\Services\ClientEmailVerificationCodes;
use Modules\Client\ValuesObjects\SendEmailVerificationResult;

final class SendEmailVerificationHandler
{
    public function __construct(
        private readonly SendEmailVerificationEloquentResolver $resolver,
        private readonly ClientEmailVerificationCodes $codes,
    ) {}

    public function handle(ClientModel $client): SendEmailVerificationResult
    {
        if ($client->email_verified_at !== null) {
            return SendEmailVerificationResult::alreadyVerified();
        }

        $code = (string) random_int(100000, 999999);

        // DEVELOPMENT ONLY. Lets local testing read the code without opening
        // Mailtrap. Gated on the `local` environment so staging and production
        // never reach it, and never a substitute for real delivery testing.
        if (app()->environment('local')) {
            Log::debug('Development OTP generated', [
                'type' => 'email_verification',
                'client_id' => $client->id,
                'otp' => $code,
            ]);
        }

        $this->codes->issue((string) $client->id, $code);

        Mail::to($client->email)->send(new SendEmailVerificationCode($code));

        return SendEmailVerificationResult::success();
    }
}
