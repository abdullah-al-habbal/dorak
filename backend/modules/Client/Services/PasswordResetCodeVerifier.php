<?php

declare(strict_types=1);

namespace Modules\Client\Services;

use Illuminate\Support\Facades\Cache;

/**
 * Single owner of the cached password-reset code. Issuing, checking, and
 * consuming the code all go through here so that the verify and reset routes
 * share one failed-attempt budget: after MAX_ATTEMPTS wrong guesses the code
 * is discarded and the client must request a new one.
 */
final class PasswordResetCodeVerifier
{
    public const int MAX_ATTEMPTS = 5;

    private const int TTL_MINUTES = 10;

    public function issue(string $clientId, string $code): void
    {
        Cache::put($this->codeKey($clientId), $code, now()->addMinutes(self::TTL_MINUTES));
        Cache::forget($this->attemptsKey($clientId));
    }

    /**
     * Checks the code without consuming it. A wrong code counts against the
     * attempt budget; an unknown client has no code and always fails.
     */
    public function verify(?string $clientId, string $code): bool
    {
        if ($clientId === null) {
            return false;
        }

        $cached = Cache::get($this->codeKey($clientId));

        if (is_string($cached) && hash_equals($cached, $code)) {
            return true;
        }

        $this->registerFailedAttempt($clientId);

        return false;
    }

    public function consume(string $clientId): void
    {
        Cache::forget($this->codeKey($clientId));
        Cache::forget($this->attemptsKey($clientId));
    }

    private function registerFailedAttempt(string $clientId): void
    {
        $key = $this->attemptsKey($clientId);

        $attempts = Cache::increment($key, 1);

        if ($attempts === false) {
            Cache::add($key, 1, now()->addMinutes(self::TTL_MINUTES));

            $attempts = 1;
        }

        if ($attempts >= self::MAX_ATTEMPTS) {
            $this->consume($clientId);
        }
    }

    private function codeKey(string $clientId): string
    {
        return "password_reset_{$clientId}";
    }

    private function attemptsKey(string $clientId): string
    {
        return "password_reset_attempts_{$clientId}";
    }
}
