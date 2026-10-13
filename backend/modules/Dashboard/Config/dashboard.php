<?php

declare(strict_types=1);

return [
    'claim_ttl_seconds' => (int) env('DASHBOARD_CLAIM_TTL_SECONDS', 28800),
    'refresh_ttl_seconds' => (int) env('DASHBOARD_REFRESH_TTL_SECONDS', 2592000),
    'session_secret' => env('DASHBOARD_SESSION_SECRET'),
    'session_secrets' => env('DASHBOARD_SESSION_SECRETS'),
    'active_kid' => env('DASHBOARD_SESSION_ACTIVE_KID'),
];
