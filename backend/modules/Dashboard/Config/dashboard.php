<?php

declare(strict_types=1);

return [
    'session_secret' => env('DASHBOARD_SESSION_SECRET'),
    'session_secrets' => env('DASHBOARD_SESSION_SECRETS'),
    'active_kid' => env('DASHBOARD_SESSION_ACTIVE_KID'),
    // Failed and successful sign-ins allowed per minute and IP. Raise it only on dev/CI so the Playwright suite can sign in repeatedly.
    'login_attempts_per_minute' => (int) env('DASHBOARD_LOGIN_ATTEMPTS_PER_MINUTE', 5),
    // The public dashboard origin, used to build links in emails (password reset).
    'frontend_url' => rtrim((string) env('DASHBOARD_URL', 'http://localhost:3000'), '/'),
];
