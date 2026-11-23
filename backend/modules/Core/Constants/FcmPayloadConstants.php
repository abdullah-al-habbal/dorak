<?php

declare(strict_types=1);

namespace Modules\Core\Constants;

final class FcmPayloadConstants
{
    public const string FCM_ANDROID_CHANNEL_ID = 'dorak_default';

    public const string FCM_ANDROID_PRIORITY = 'HIGH';

    public const string FCM_ANDROID_DEFAULT_SOUND = 'default';

    public const string FCM_APNS_PRIORITY_HEADER = 'apns-priority';

    public const string FCM_APNS_PRIORITY_IMMEDIATE = '10';

    public const string FCM_APNS_DEFAULT_SOUND = 'default';

    public const string FCM_APNS_PUSH_TYPE_HEADER = 'apns-push-type';

    public const string FCM_APNS_PUSH_TYPE_ALERT = 'alert';

    public const int FCM_TTL_SECONDS = 86400;
}
