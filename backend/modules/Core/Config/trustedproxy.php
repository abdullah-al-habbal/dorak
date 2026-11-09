<?php

declare(strict_types=1);

// Read by Laravel's TrustProxies middleware. List only the dashboard (Next.js)
// server addresses, comma separated: they forward the visitor's IP in
// X-Forwarded-For so per-IP rate limits count visitors, not the dashboard
// server. A wildcard would let any caller choose its own IP, so it is refused.
$trustedProxies = env('TRUSTED_PROXIES');

return [
    'proxies' => in_array($trustedProxies, ['*', '**'], true) ? null : $trustedProxies,
];
