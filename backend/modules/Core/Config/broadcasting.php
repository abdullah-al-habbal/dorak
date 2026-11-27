<?php

declare(strict_types=1);

use Illuminate\Support\Env;
use Modules\Core\Constants\BroadcastingConstants;

$reverbScheme = env('REVERB_SCHEME') ?? BroadcastingConstants::BROADCASTING_SECURE_SCHEME;

return [
    // Read raw: env() turns the value "null" (the null connection) into null, which would look unset.
    'default' => Env::getRepository()->get('BROADCAST_CONNECTION') ?? BroadcastingConstants::BROADCASTING_DEFAULT_CONNECTION,

    'connections' => [
        'reverb' => [
            'driver' => 'reverb',
            'key' => env('REVERB_APP_KEY'),
            'secret' => env('REVERB_APP_SECRET'),
            'app_id' => env('REVERB_APP_ID'),
            'options' => [
                'cluster' => env('REVERB_CLUSTER') ?? BroadcastingConstants::BROADCASTING_DEFAULT_CLUSTER,
                'host' => env('REVERB_HOST'),
                'port' => env('REVERB_PORT') ?? BroadcastingConstants::BROADCASTING_DEFAULT_PORT,
                'scheme' => $reverbScheme,
                'useTLS' => $reverbScheme === BroadcastingConstants::BROADCASTING_SECURE_SCHEME,
            ],
            'client_options' => [
                'timeout' => 10,
            ],
        ],

        'log' => [
            'driver' => 'log',
        ],

        'null' => [
            'driver' => 'null',
        ],
    ],
];
