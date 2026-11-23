<?php

declare(strict_types=1);

namespace Modules\Core\Services;

use Modules\Core\Constants\FcmPayloadConstants;
use Modules\Core\Enums\DevicePlatformEnum;

/** Builds the FCM v1 `message` body (without the target token) for one device. */
final class FcmPayloadBuilder
{
    /**
     * @param  array<string, bool|float|int|string|null>  $data
     * @return array<string, mixed>
     */
    public function build(string $title, string $body, array $data, ?string $locale = null, DevicePlatformEnum $platform = DevicePlatformEnum::Android): array
    {
        if ($platform === DevicePlatformEnum::Web) {
            return $this->web($title, $body, $data, $locale);
        }

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

    /**
     * Browser payload: no android or apns blocks; the notification carries the text direction and
     * language of the device so an Arabic dashboard renders right to left.
     *
     * @param  array<string, bool|float|int|string|null>  $data
     * @return array<string, mixed>
     */
    private function web(string $title, string $body, array $data, ?string $locale): array
    {
        $notification = ['title' => $title, 'body' => $body];

        if ($locale !== null) {
            $notification['lang'] = $locale;
            $notification['dir'] = $locale === FcmPayloadConstants::FCM_WEBPUSH_RTL_LOCALE ? 'rtl' : 'ltr';
        }

        return [
            'data' => (object) array_map(
                static fn (bool|float|int|string|null $value): string => is_scalar($value) ? (string) $value : '',
                $data,
            ),
            'webpush' => [
                'headers' => [
                    FcmPayloadConstants::FCM_WEBPUSH_TTL_HEADER => (string) FcmPayloadConstants::FCM_TTL_SECONDS,
                    FcmPayloadConstants::FCM_WEBPUSH_URGENCY_HEADER => FcmPayloadConstants::FCM_WEBPUSH_URGENCY_HIGH,
                ],
                'notification' => $notification,
            ],
        ];
    }
}
