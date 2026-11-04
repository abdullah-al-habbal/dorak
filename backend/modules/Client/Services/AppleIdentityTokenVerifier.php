<?php

declare(strict_types=1);

namespace Modules\Client\Services;

use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use InvalidArgumentException;
use Laravel\Socialite\Two\User as SocialUser;

/**
 * Verifies a "Sign in with Apple" identity token (an RS256 JWT) against Apple's published keys.
 * Laravel Socialite has no Apple driver, so the handler uses this for the `apple` provider.
 */
final class AppleIdentityTokenVerifier
{
    private const KEYS_URL = 'https://appleid.apple.com/auth/keys';

    private const ISSUER = 'https://appleid.apple.com';

    private const ALGORITHM = 'RS256';

    private const KEYS_CACHE_KEY = 'social.apple.jwks';

    private const KEYS_CACHE_TTL_SECONDS = 3600;

    private const KEYS_TIMEOUT_SECONDS = 5;

    /**
     * @throws \Throwable when the token is malformed, expired, mis-signed or not issued for this app
     */
    public function verify(string $identityToken): SocialUser
    {
        $audience = config('services.apple.client_id');

        if (! is_string($audience) || $audience === '') {
            throw new InvalidArgumentException('Apple sign-in is not configured.');
        }

        $claims = JWT::decode($identityToken, JWK::parseKeySet($this->keySet(), self::ALGORITHM));

        if (($claims->iss ?? null) !== self::ISSUER || ($claims->aud ?? null) !== $audience || ! is_string($claims->sub ?? null)) {
            throw new InvalidArgumentException('Apple identity token was not issued for this app.');
        }

        $user = new SocialUser;
        $user->map([
            'id' => $claims->sub,
            'email' => $claims->email ?? null,
            'name' => null,
            'avatar' => null,
        ]);
        $user->setRaw(['email_verified' => $claims->email_verified ?? false]);

        return $user;
    }

    /**
     * @return array<string, mixed>
     */
    private function keySet(): array
    {
        return Cache::remember(
            self::KEYS_CACHE_KEY,
            self::KEYS_CACHE_TTL_SECONDS,
            fn (): array => Http::timeout(self::KEYS_TIMEOUT_SECONDS)->get(self::KEYS_URL)->throw()->json(),
        );
    }
}
