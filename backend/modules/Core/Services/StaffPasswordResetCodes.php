<?php

declare(strict_types=1);

namespace Modules\Core\Services;

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
        private readonly OneTimeCodes $codes,
        private readonly SettingsService $settings,
    ) {}

    public function issue(string $scope, string $accountId, string $code): void
    {
        $this->codes->issue($this->codeKey($scope, $accountId), $code, now()->addMinutes($this->settings->int(SettingKey::ClientPasswordResetTtlMinutes)));
    }

    /** Whether the code is right, consuming it. A wrong guess is counted. */
    public function redeem(string $scope, ?string $accountId, string $code): bool
    {
        if ($accountId === null) {
            $this->codes->refuse($code);

            return false;
        }

        return $this->codes->redeem($this->codeKey($scope, $accountId), $code, $this->settings->int(SettingKey::ClientPasswordResetMaxAttempts)) !== null;
    }

    /** Burns a pending code, if any. */
    public function consume(string $scope, string $accountId): void
    {
        $this->codes->forget($this->codeKey($scope, $accountId));
    }

    private function codeKey(string $scope, string $accountId): string
    {
        return "staff_password_reset_{$scope}_{$accountId}";
    }
}
