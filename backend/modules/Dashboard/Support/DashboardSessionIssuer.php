<?php

declare(strict_types=1);

namespace Modules\Dashboard\Support;

use Modules\Dashboard\Handlers\DashboardLoginHandler;
use Modules\Dashboard\Repositories\DashboardRefreshTokenResolver;

/** Builds the session payload every dashboard sign-in returns (login, and owner verification). */
final class DashboardSessionIssuer
{
    public function __construct(
        private readonly DashboardLoginHandler $handler,
        private readonly DashboardSessionClaim $claim,
        private readonly DashboardRefreshTokenResolver $refreshResolver,
    ) {}

    /** @return array<string, mixed> */
    public function issue(DashboardActor $actor): array
    {
        return [
            'claim' => $this->claim->issue($actor),
            'expires_in' => $this->claim->expiresIn(),
            'token' => $this->handler->createToken($actor),
            'refresh_token' => $this->refreshResolver->issue($actor),
            'refresh_expires_in' => $this->refreshResolver->ttl(),
        ];
    }
}
