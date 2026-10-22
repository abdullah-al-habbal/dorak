<?php

declare(strict_types=1);

namespace Modules\Core\Services\Sms;

use Illuminate\Support\Facades\Log;
use Modules\Core\Contracts\SmsSender;

final class LogSmsSender implements SmsSender
{
    public function send(string $phone, string $message): void
    {
        if (app()->environment('production')) {
            Log::info('SMS dispatched', ['phone' => $this->mask($phone)]);

            return;
        }

        Log::info('SMS dispatched', ['phone' => $phone, 'message' => $message]);
    }

    private function mask(string $phone): string
    {
        return str_repeat('*', max(strlen($phone) - 4, 0)).substr($phone, -4);
    }
}
