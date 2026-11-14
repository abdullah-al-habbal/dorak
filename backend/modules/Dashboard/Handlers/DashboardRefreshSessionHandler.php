<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers;

use Illuminate\Support\Facades\DB;
use Modules\Dashboard\Repositories\DashboardRefreshTokenResolver;
use Modules\Dashboard\Support\DashboardSessionClaim;
use Modules\Dashboard\Support\DashboardSessionIssuer;
use Throwable;

/**
 * Renews a dashboard session. Order (F-05h, F-05i):
 *  1. the refresh token is validated and rotated (single use, row lock) and the new access token and claim are issued in ONE transaction,
 *     so any failure while issuing rolls the rotation back and the refresh token stays usable;
 *  2. in the same transaction, the superseded access token is expired (the row is kept, D-02) when the previous claim proves it belongs to
 *     the rotated actor, so the durable revocation commits or rolls back together with the rotation;
 *  3. only after the commit is the previous claim revoked in the cache (a non-transactional store), as defense in depth.
 * An invalid refresh token changes nothing: no claim is revoked and no token is touched.
 */
final class DashboardRefreshSessionHandler
{
    public function __construct(
        private readonly DashboardRefreshTokenResolver $refreshResolver,
        private readonly DashboardSessionIssuer $issuer,
        private readonly DashboardLoginHandler $loginHandler,
        private readonly DashboardSessionClaim $claim,
    ) {}

    /** @return array<string, mixed>|null the new session payload, or null when the refresh token is not usable */
    public function refresh(string $refreshToken, ?string $previousClaim): ?array
    {
        $supersededClaim = null;

        $session = DB::transaction(function () use ($refreshToken, $previousClaim, &$supersededClaim): ?array {
            $rotated = $this->refreshResolver->rotate($refreshToken);
            if ($rotated === null) {
                return null;
            }

            $actor = $rotated['actor'];
            $previousTokenId = $previousClaim === null ? null : $this->claim->boundTokenId($previousClaim, $actor);
            if ($previousTokenId !== null) {
                $this->loginHandler->expireAccessToken($actor, $previousTokenId);
                $supersededClaim = $previousClaim;
            }

            return [
                ...$this->issuer->issueAccess($actor),
                'refresh_token' => $rotated['token'],
                'refresh_expires_in' => $this->refreshResolver->ttl(),
            ];
        });

        if ($supersededClaim !== null) {
            $this->revokeClaimAfterCommit($supersededClaim);
        }

        return $session;
    }

    /** The token row is already expired in the database, so a cache outage here must not cost the user the session that was just issued. */
    private function revokeClaimAfterCommit(string $previousClaim): void
    {
        try {
            $this->claim->revokeClaim($previousClaim);
        } catch (Throwable $exception) {
            report($exception);
        }
    }
}
