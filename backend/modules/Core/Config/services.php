<?php

declare(strict_types=1);

return [
    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],
    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],
    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION'),
    ],
    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],
    'sms' => [
        'driver' => env('SMS_DRIVER'),
        'http' => [
            'url' => env('SMS_HTTP_URL'),
            'format' => env('SMS_HTTP_FORMAT'),
            'headers' => env('SMS_HTTP_HEADERS'),
            'payload' => env('SMS_HTTP_PAYLOAD'),
            'timeout' => env('SMS_HTTP_TIMEOUT'),
        ],
    ],
    'fcm' => [
        'project_id' => env('FCM_PROJECT_ID'),
        'credentials' => env('FCM_CREDENTIALS'),
    ],
];
