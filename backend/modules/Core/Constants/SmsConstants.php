<?php

declare(strict_types=1);

namespace Modules\Core\Constants;

final class SmsConstants
{
    public const string SMS_PLACEHOLDER_PHONE = '{{phone}}';

    public const string SMS_PLACEHOLDER_MESSAGE = '{{message}}';

    public const int SMS_HTTP_DEFAULT_TIMEOUT_SECONDS = 10;

    public const int SMS_HTTP_CONNECT_TIMEOUT_SECONDS = 3;

    /** @var array<string, string> */
    public const array SMS_HTTP_DEFAULT_PAYLOAD = [
        'to' => self::SMS_PLACEHOLDER_PHONE,
        'message' => self::SMS_PLACEHOLDER_MESSAGE,
    ];
}
