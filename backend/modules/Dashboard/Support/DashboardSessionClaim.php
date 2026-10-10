<?php

declare(strict_types=1);

namespace Modules\Dashboard\Support;

use JsonException;
use RuntimeException;

final class DashboardSessionClaim
{
    private const string Algorithm = 'HS256';

    private const string Issuer = 'dorak-backend';

    private const int DefaultTtlSeconds = 28800;

    public function issue(DashboardActor $actor): string
    {
        $secret = config('dashboard.dashboard.session_secret');
        if (! is_string($secret) || mb_strlen($secret) < 32) {
            throw new RuntimeException('DASHBOARD_SESSION_SECRET must be at least 32 characters.');
        }

        $ttl = $this->expiresIn();

        $issuedAt = time();
        $payload = [
            'actor_type' => $actor->actorType,
            'exp' => $issuedAt + $ttl,
            'iat' => $issuedAt,
            'iss' => self::Issuer,
            'role' => $actor->role,
            'sub' => $actor->id,
            ...($actor->branchId === null ? [] : ['branch_id' => $actor->branchId]),
        ];
        $encodedHeader = $this->encode(['alg' => self::Algorithm, 'typ' => 'JWT']);
        $encodedPayload = $this->encode($payload);
        $signature = hash_hmac('sha256', $encodedHeader.'.'.$encodedPayload, $secret, true);

        return $encodedHeader.'.'.$encodedPayload.'.'.$this->base64Url($signature);
    }

    public function expiresIn(): int
    {
        $ttl = config('dashboard.dashboard.claim_ttl_seconds', self::DefaultTtlSeconds);
        if (! is_int($ttl) || $ttl < 60) {
            throw new RuntimeException('DASHBOARD_CLAIM_TTL_SECONDS must be at least 60 seconds.');
        }

        return $ttl;
    }

    /** @param array<string, int|string> $value */
    private function encode(array $value): string
    {
        try {
            return $this->base64Url(json_encode($value, JSON_THROW_ON_ERROR));
        } catch (JsonException $exception) {
            throw new RuntimeException('Unable to encode dashboard claim.', previous: $exception);
        }
    }

    private function base64Url(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
