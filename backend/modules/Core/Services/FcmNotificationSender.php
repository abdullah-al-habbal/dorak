<?php

declare(strict_types=1);

namespace Modules\Core\Services;

use Illuminate\Support\Facades\Http;
use Modules\Core\Models\DeviceTokenModel;

final class FcmNotificationSender
{
    public function sendTo(string $userType, string $userId, string $title, string $body, array $data): void
    {
        $serverKey = (string) config('services.fcm.server_key');

        if ($serverKey === '') {
            return;
        }

        DeviceTokenModel::query()
            ->where('user_type', $userType)
            ->where('user_id', $userId)
            ->pluck('token')
            ->each(fn (string $token) => Http::withToken($serverKey)->post('https://fcm.googleapis.com/fcm/send', [
                'to' => $token,
                'notification' => ['title' => $title, 'body' => $body],
                'data' => $data,
            ])->throw());
    }
}
