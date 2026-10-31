<?php

declare(strict_types=1);

return [
    'session_secret' => env('DASHBOARD_SESSION_SECRET'),
    'session_secrets' => env('DASHBOARD_SESSION_SECRETS'),
    'active_kid' => env('DASHBOARD_SESSION_ACTIVE_KID'),
];
