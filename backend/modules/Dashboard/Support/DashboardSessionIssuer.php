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
            ...$this->issueAccess($actor),
            'refresh_token' => $this->refreshResolver->issue($actor),
            'refresh_expires_in' => $this->refreshResolver->ttl(),
        ];
    }

    /**
     * The access token first, then the claim bound to that token's id (`tid`): the pair is the only combination the middleware accepts.
     *
     * @return array{claim: string, expires_in: int, token: string}
     */
    public function issueAccess(DashboardActor $actor): array
    {
        $access = $this->handler->createAccessToken($actor);

        return [
            'claim' => $this->claim->issue($actor, $access->accessToken->getKey()),
            'expires_in' => $this->claim->expiresIn(),
            'token' => $access->plainTextToken,
        ];
    }
}
