<?php

declare(strict_types=1);

namespace Modules\Dashboard\Support;

use Illuminate\Support\Str;
use JsonException;
use Modules\Dashboard\Constants\DashboardSessionConstants;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;
use RuntimeException;

final class DashboardSessionClaim
{
    /** @param int|string $tokenId id of the Sanctum access token this claim is bound to (claim key `tid`) */
    public function issue(DashboardActor $actor, int|string $tokenId): string
    {
        [$kid, $secret] = $this->activeSecret();

        $ttl = $this->expiresIn();

        $issuedAt = time();
        $payload = [
            'actor_type' => $actor->actorType->value,
            'exp' => $issuedAt + $ttl,
            'iat' => $issuedAt,
            'iss' => DashboardSessionConstants::DASHBOARD_SESSION_CLAIM_ISSUER,
            'jti' => (string) Str::uuid(),
            'role' => $actor->role,
            'sub' => $actor->id,
            'tid' => (string) $tokenId,
            ...($actor->branchId === null ? [] : ['branch_id' => $actor->branchId]),
            ...($actor->isBrandOwner() ? ['brand_id' => $actor->brandId, 'brand_ids' => $actor->brandIds] : []),
        ];
        $encodedHeader = $this->encode(['alg' => DashboardSessionConstants::DASHBOARD_SESSION_CLAIM_ALGORITHM, 'kid' => $kid, 'typ' => 'JWT']);
        $encodedPayload = $this->encode($payload);
        $signature = hash_hmac('sha256', $encodedHeader.'.'.$encodedPayload, $secret, true);

        return $encodedHeader.'.'.$encodedPayload.'.'.$this->base64Url($signature);
    }

    /** @return array{string, string} */
    public function activeSecret(): array
    {
        $secrets = $this->secrets();
        $kid = config('dashboard.dashboard.active_kid');
        $kid = is_string($kid) && $kid !== '' ? $kid : 'default';
        if (! isset($secrets[$kid])) {
            throw new RuntimeException(__('dashboard::messages.session_secret_invalid'));
        }

        return [$kid, $secrets[$kid]];
    }

    /** @return array<string, string> */
    public function secrets(): array
    {
        $raw = config('dashboard.dashboard.session_secrets');
        $secrets = [];
        if (is_string($raw) && $raw !== '') {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                foreach ($decoded as $kid => $secret) {
                    if (is_string($kid) && is_string($secret) && mb_strlen($secret) >= 32) {
                        $secrets[$kid] = $secret;
                    }
                }
            } else {
                foreach (explode(',', $raw) as $pair) {
                    [$kid, $secret] = array_pad(explode(':', $pair, 2), 2, '');
                    if ($kid !== '' && mb_strlen($secret) >= 32) {
                        $secrets[$kid] = $secret;
                    }
                }
            }
        }

        $fallback = config('dashboard.dashboard.session_secret');
        if ($secrets === [] && is_string($fallback) && mb_strlen($fallback) >= 32) {
            $secrets['default'] = $fallback;
        }

        if (! isset($secrets['default']) && is_string($fallback) && mb_strlen($fallback) >= 32) {
            $secrets['default'] = $fallback;
        }

        return $secrets;
    }

    public function isRevoked(string $jti): bool
    {
        return cache()->has('dashboard:revoked-jti:'.$jti);
    }

    public function revoke(string $jti, int $expiresAt): void
    {
        $seconds = max(1, $expiresAt - time());
        cache()->put('dashboard:revoked-jti:'.$jti, true, now()->addSeconds($seconds));
    }

    public function revokeClaim(?string $token): void
    {
        $payload = is_string($token) ? $this->signedPayload($token) : null;
        if ($payload !== null) {
            $this->revoke($payload['jti'], $payload['exp']);
        }
    }

    /**
     * The id of the access token a claim was issued for, but only when the claim is genuinely signed and unexpired AND belongs to this actor
     * (`sub`, `actor_type`). A forged, expired, legacy (no `tid`) or foreign claim yields null, so it can never be used to touch another actor's token.
     * Revocation state is ignored on purpose: a replayed, already revoked claim still names the token that must stay dead.
     */
    public function boundTokenId(string $token, DashboardActor $actor): ?string
    {
        $payload = $this->signedPayload($token);
        if ($payload === null || ! is_string($payload['tid'] ?? null) || $payload['tid'] === '') {
            return null;
        }

        return ($payload['sub'] ?? null) === $actor->id && ($payload['actor_type'] ?? null) === $actor->actorType->value
            ? $payload['tid']
            : null;
    }

    public function isValid(string $token): bool
    {
        return $this->verifiedPayload($token) !== null;
    }

    /**
     * True when the claim is valid (signature, expiry, issuer, revocation) AND is bound to this exact access token and actor.
     * A claim without `tid` (legacy) never matches.
     */
    public function matches(string $token, int|string $tokenId, DashboardActor $actor): bool
    {
        $payload = $this->verifiedPayload($token);
        if ($payload === null) {
            return false;
        }

        return is_string($payload['tid'] ?? null) && hash_equals((string) $tokenId, $payload['tid'])
            && ($payload['sub'] ?? null) === $actor->id
            && ($payload['actor_type'] ?? null) === $actor->actorType->value;
    }

    /** @return array<string, mixed>|null the payload of a claim whose signature, issuer, expiry and revocation state are valid */
    private function verifiedPayload(string $token): ?array
    {
        $payload = $this->signedPayload($token);

        return $payload !== null && ! $this->isRevoked($payload['jti']) ? $payload : null;
    }

    /** @return array<string, mixed>|null the payload of a claim whose algorithm, issuer, `kid`, signature and expiry are valid (revocation is not consulted) */
    private function signedPayload(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        try {
            $header = json_decode((string) base64_decode(strtr($parts[0], '-_', '+/')), true, flags: JSON_THROW_ON_ERROR);
            $payload = json_decode((string) base64_decode(strtr($parts[1], '-_', '+/')), true, flags: JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            return null;
        }

        if (! is_array($header) || ($header['alg'] ?? null) !== DashboardSessionConstants::DASHBOARD_SESSION_CLAIM_ALGORITHM
            || ! is_array($payload) || ($payload['iss'] ?? null) !== DashboardSessionConstants::DASHBOARD_SESSION_CLAIM_ISSUER
            || ! is_string($header['kid'] ?? null) || ! is_string($payload['jti'] ?? null)
            || ! is_int($payload['exp'] ?? null) || $payload['exp'] <= time()) {
            return null;
        }

        $secret = $this->secrets()[$header['kid']] ?? null;
        if (! is_string($secret)) {
            return null;
        }

        $expected = $this->base64Url(hash_hmac('sha256', $parts[0].'.'.$parts[1], $secret, true));

        return hash_equals($expected, $parts[2]) ? $payload : null;
    }

    public function expiresIn(): int
    {
        return app(SettingsService::class)->int(SettingKey::DashboardSessionTtlSeconds);
    }

    /** @param array<string, int|string|list<string>|null> $value */
    private function encode(array $value): string
    {
        try {
            return $this->base64Url(json_encode($value, JSON_THROW_ON_ERROR));
        } catch (JsonException $exception) {
            throw new RuntimeException(__('dashboard::messages.claim_encoding_failed'), previous: $exception);
        }
    }

    private function base64Url(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
