<?php

declare(strict_types=1);

namespace Modules\Core\Services;

use Illuminate\Support\Facades\Cache;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

/**
 * One-time password reset codes for staff accounts (barber, branch). Codes are
 * scoped per account type so ids can never collide across guards, expire with
 * the shared reset TTL setting, and burn after too many wrong attempts.
 */
final class StaffPasswordResetCodes
{
    public function __construct(
        private readonly SettingsService $settings,
    ) {}

    public function issue(string $scope, string $accountId, string $code): void
    {
        Cache::put($this->codeKey($scope, $accountId), $code, now()->addMinutes($this->settings->int(SettingKey::ClientPasswordResetTtlMinutes)));
        Cache::forget($this->attemptsKey($scope, $accountId));
    }

    public function verify(string $scope, ?string $accountId, string $code): bool
    {
        if ($accountId === null) {
            return false;
        }

        $cached = Cache::get($this->codeKey($scope, $accountId));

        if (is_string($cached) && hash_equals($cached, $code)) {
            return true;
        }

        $this->registerFailedAttempt($scope, $accountId);

        return false;
    }

    public function consume(string $scope, string $accountId): void
    {
        Cache::forget($this->codeKey($scope, $accountId));
        Cache::forget($this->attemptsKey($scope, $accountId));
    }

    private function registerFailedAttempt(string $scope, string $accountId): void
    {
        $key = $this->attemptsKey($scope, $accountId);
        $attempts = Cache::increment($key, 1);

        if ($attempts === false) {
            Cache::add($key, 1, now()->addMinutes($this->settings->int(SettingKey::ClientPasswordResetTtlMinutes)));
            $attempts = 1;
        }

        if ($attempts >= $this->settings->int(SettingKey::ClientPasswordResetMaxAttempts)) {
            $this->consume($scope, $accountId);
        }
    }

    private function codeKey(string $scope, string $accountId): string
    {
        return "staff_password_reset_{$scope}_{$accountId}";
    }

    private function attemptsKey(string $scope, string $accountId): string
    {
        return "staff_password_reset_attempts_{$scope}_{$accountId}";
    }
}
