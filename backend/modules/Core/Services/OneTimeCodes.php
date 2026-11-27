<?php

declare(strict_types=1);

namespace Modules\Core\Services;

use Closure;
use DateTimeInterface;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Hash;
use Modules\Core\Constants\OneTimeCodeConstants;
use Modules\Core\Exceptions\OneTimeCodeUnavailableException;

/**
 * Cached one-time codes (BG-28). Only a hash is stored. Reading, comparing, counting a wrong guess and consuming
 * happen under one lock per key, so a code works once and parallel guesses can't pass the attempt budget. The
 * guarantee spans servers only with a shared cache store. A guess that can't get the lock is refused; a code that
 * can't be stored or burned throws, so nothing is sent or changed on the strength of a write that didn't happen.
 */
final class OneTimeCodes
{
    /**
     * Replaces any earlier code for the key and starts a fresh attempt budget.
     *
     * @param  array<string, string>  $context  data the code is bound to, returned when it is accepted
     *
     * @throws OneTimeCodeUnavailableException
     */
    public function issue(string $key, string $code, DateTimeInterface $expiresAt, array $context = []): void
    {
        $entry = ['hash' => Hash::make($code), 'attempts' => 0, 'expires_at' => $expiresAt->getTimestamp(), 'context' => $context];

        if ($this->locked($key, fn (): bool => Cache::put($key, $entry, $expiresAt)) !== true) {
            throw new OneTimeCodeUnavailableException;
        }
    }

    /** Whether the code is right, without consuming it. A wrong guess is counted. */
    public function check(string $key, string $code, int $maxAttempts): bool
    {
        return $this->locked($key, fn (): ?array => $this->match($key, $code, $maxAttempts)) !== null;
    }

    /**
     * Consumes the code when it is right and returns its context. Null means refused; a wrong guess is counted.
     *
     * @return array<string, string>|null
     */
    public function redeem(string $key, string $code, int $maxAttempts): ?array
    {
        return $this->locked($key, function () use ($key, $code, $maxAttempts): ?array {
            $context = $this->match($key, $code, $maxAttempts);

            if ($context !== null) {
                $this->remove($key);
            }

            return $context;
        });
    }

    /**
     * Refuses a guess that has no account behind it, at the cost of a real comparison: on the public reset routes
     * the response time must not show which email has an account or a pending code.
     */
    public function refuse(string $code): void
    {
        Hash::make($code);
    }

    /** @throws OneTimeCodeUnavailableException when a pending code may still be usable */
    public function forget(string $key): void
    {
        if ($this->locked($key, fn (): bool => $this->remove($key)) !== true) {
            throw new OneTimeCodeUnavailableException;
        }
    }

    /** Stores report a missing key and a failed delete alike, so the key itself is read back. The caller holds the lock. */
    private function remove(string $key): bool
    {
        Cache::forget($key);

        if (Cache::has($key)) {
            throw new OneTimeCodeUnavailableException;
        }

        return true;
    }

    /** @return array<string, string>|null the context of a right code; the caller holds the lock */
    private function match(string $key, string $code, int $maxAttempts): ?array
    {
        $entry = Cache::get($key);

        // Anything else under the key (a value from before BG-28) counts as no code.
        if (! is_array($entry) || ! isset($entry['hash'], $entry['attempts'], $entry['expires_at'], $entry['context'])) {
            $this->refuse($code);

            return null;
        }

        if (Hash::check($code, $entry['hash'])) {
            return $entry['context'];
        }

        $entry['attempts']++;

        if ($entry['attempts'] >= $maxAttempts) {
            $this->remove($key);
        } elseif (! Cache::put($key, $entry, Date::createFromTimestamp($entry['expires_at']))) {
            // A guess that can't be counted must not leave the budget open.
            $this->remove($key);
        }

        return null;
    }

    /**
     * @template T
     *
     * @param  Closure(): T  $callback
     * @return T|null
     */
    private function locked(string $key, Closure $callback): mixed
    {
        try {
            return Cache::lock($key.OneTimeCodeConstants::LOCK_SUFFIX, OneTimeCodeConstants::LOCK_TTL_SECONDS)
                ->block(OneTimeCodeConstants::LOCK_WAIT_SECONDS, $callback);
        } catch (LockTimeoutException $exception) {
            report($exception);

            return null;
        }
    }
}
