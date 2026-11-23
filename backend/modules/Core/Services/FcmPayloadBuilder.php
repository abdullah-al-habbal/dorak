<?php

declare(strict_types=1);

namespace Modules\Core\Services;

use Modules\Core\Constants\FcmPayloadConstants;

/** Builds the FCM v1 `message` body (without the target token) for one device. */
final class FcmPayloadBuilder
{
    /**
     * @param  array<string, bool|float|int|string|null>  $data
     * @return array{notification: array{title: string, body: string}, data: object, android: array<string, mixed>, apns: array<string, mixed>}
     */
    public function build(string $title, string $body, array $data): array
    {
        return [
            'notification' => ['title' => $title, 'body' => $body],
            'data' => (object) array_map(
                static fn (bool|float|int|string|null $value): string => is_scalar($value) ? (string) $value : '',
                $data,
            ),
            'android' => [
                'priority' => FcmPayloadConstants::FCM_ANDROID_PRIORITY,
                'ttl' => FcmPayloadConstants::FCM_TTL_SECONDS.'s',
                'notification' => [
                    'channel_id' => FcmPayloadConstants::FCM_ANDROID_CHANNEL_ID,
                    'sound' => FcmPayloadConstants::FCM_ANDROID_DEFAULT_SOUND,
                ],
            ],
            'apns' => [
                'headers' => [
                    FcmPayloadConstants::FCM_APNS_PRIORITY_HEADER => FcmPayloadConstants::FCM_APNS_PRIORITY_IMMEDIATE,
                    FcmPayloadConstants::FCM_APNS_PUSH_TYPE_HEADER => FcmPayloadConstants::FCM_APNS_PUSH_TYPE_ALERT,
                ],
                'payload' => ['aps' => ['sound' => FcmPayloadConstants::FCM_APNS_DEFAULT_SOUND]],
            ],
        ];
    }
}
