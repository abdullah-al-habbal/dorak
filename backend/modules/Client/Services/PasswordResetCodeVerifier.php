<?php

declare(strict_types=1);

namespace Modules\Client\Services;

use Illuminate\Support\Facades\Cache;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

final class PasswordResetCodeVerifier
{
    public function issue(string $clientId, string $code): void
    {
        Cache::put($this->codeKey($clientId), $code, now()->addMinutes(app(SettingsService::class)->int(SettingKey::ClientPasswordResetTtlMinutes)));
        Cache::forget($this->attemptsKey($clientId));
    }

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
            Cache::add($key, 1, now()->addMinutes(app(SettingsService::class)->int(SettingKey::ClientPasswordResetTtlMinutes)));

            $attempts = 1;
        }

        if ($attempts >= app(SettingsService::class)->int(SettingKey::ClientPasswordResetMaxAttempts)) {
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
