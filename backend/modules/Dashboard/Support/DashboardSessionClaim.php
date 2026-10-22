<?php

declare(strict_types=1);

namespace Modules\Dashboard\Support;

use Illuminate\Support\Str;
use JsonException;
use RuntimeException;

final class DashboardSessionClaim
{
    private const string Algorithm = 'HS256';

    private const string Issuer = 'dorak-backend';

    private const int DefaultTtlSeconds = 28800;

    public function issue(DashboardActor $actor): string
    {
        [$kid, $secret] = $this->activeSecret();

        $ttl = $this->expiresIn();

        $issuedAt = time();
        $payload = [
            'actor_type' => $actor->actorType,
            'exp' => $issuedAt + $ttl,
            'iat' => $issuedAt,
            'iss' => self::Issuer,
            'jti' => (string) Str::uuid(),
            'role' => $actor->role,
            'sub' => $actor->id,
            ...($actor->branchId === null ? [] : ['branch_id' => $actor->branchId]),
            ...($actor->isBrandOwner() ? ['brand_id' => $actor->brandId, 'brand_ids' => $actor->brandIds] : []),
        ];
        $encodedHeader = $this->encode(['alg' => self::Algorithm, 'kid' => $kid, 'typ' => 'JWT']);
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
        if (! is_string($token)) {
            return;
        }

        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return;
        }

        try {
            $header = json_decode((string) base64_decode(strtr($parts[0], '-_', '+/')), true, flags: JSON_THROW_ON_ERROR);
            $payload = json_decode((string) base64_decode(strtr($parts[1], '-_', '+/')), true, flags: JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            return;
        }

        if (! is_array($header) || ! is_array($payload) || ! is_string($header['kid'] ?? null)
            || ! is_string($payload['jti'] ?? null) || ! is_int($payload['exp'] ?? null)) {
            return;
        }

        $secret = $this->secrets()[$header['kid']] ?? null;
        $expected = is_string($secret)
            ? $this->base64Url(hash_hmac('sha256', $parts[0].'.'.$parts[1], $secret, true))
            : '';
        if ($secret !== null && hash_equals($expected, $parts[2]) && $payload['exp'] > time()) {
            $this->revoke($payload['jti'], $payload['exp']);
        }
    }

    public function isValid(string $token): bool
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }

        try {
            $header = json_decode((string) base64_decode(strtr($parts[0], '-_', '+/')), true, flags: JSON_THROW_ON_ERROR);
            $payload = json_decode((string) base64_decode(strtr($parts[1], '-_', '+/')), true, flags: JSON_THROW_ON_ERROR);
        } catch (JsonException) {
            return false;
        }

        if (! is_array($header) || ($header['alg'] ?? null) !== self::Algorithm
            || ! is_array($payload) || ($payload['iss'] ?? null) !== self::Issuer
            || ! is_string($header['kid'] ?? null) || ! is_string($payload['jti'] ?? null)
            || ! is_int($payload['exp'] ?? null) || $payload['exp'] <= time()) {
            return false;
        }

        $secret = $this->secrets()[$header['kid']] ?? null;
        if (! is_string($secret)) {
            return false;
        }

        $expected = $this->base64Url(hash_hmac('sha256', $parts[0].'.'.$parts[1], $secret, true));

        return hash_equals($expected, $parts[2]) && ! $this->isRevoked($payload['jti']);
    }

    public function expiresIn(): int
    {
        $ttl = config('dashboard.dashboard.claim_ttl_seconds', self::DefaultTtlSeconds);
        if (! is_int($ttl) || $ttl < 60) {
            throw new RuntimeException(__('dashboard::messages.claim_ttl_invalid'));
        }

        return $ttl;
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
