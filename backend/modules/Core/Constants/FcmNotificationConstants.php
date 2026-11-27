<?php

declare(strict_types=1);

namespace Modules\Core\Constants;

final class FcmNotificationConstants
{
    public const string FCM_NOTIFICATION_GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';

    public const string FCM_NOTIFICATION_OAUTH_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';

    public const string FCM_NOTIFICATION_UNREGISTERED_CODE = 'UNREGISTERED';

    public const string FCM_NOTIFICATION_INVALID_ARGUMENT_CODE = 'INVALID_ARGUMENT';

    public const string FCM_NOTIFICATION_TOKEN_FIELD = 'message.token';

    public const string FCM_NOTIFICATION_BAD_TOKEN_PHRASE = 'registration token';
}
