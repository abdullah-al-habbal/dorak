<?php

declare(strict_types=1);

namespace Modules\Client\Services;

use Modules\Core\Services\OneTimeCodes;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

final class PasswordResetCodeVerifier
{
    public function __construct(
        private readonly OneTimeCodes $codes,
        private readonly SettingsService $settings,
    ) {}

    public function issue(string $clientId, string $code): void
    {
        $this->codes->issue($this->codeKey($clientId), $code, now()->addMinutes($this->settings->int(SettingKey::ClientPasswordResetTtlMinutes)));
    }

    /** Whether the code is right, without consuming it (the app's "verify the code" step). */
    public function verify(?string $clientId, string $code): bool
    {
        if ($clientId === null) {
            $this->codes->refuse($code);

            return false;
        }

        return $this->codes->check($this->codeKey($clientId), $code, $this->maxAttempts());
    }

    /** Whether the code is right, consuming it: the step that changes the password. */
    public function redeem(?string $clientId, string $code): bool
    {
        if ($clientId === null) {
            $this->codes->refuse($code);

            return false;
        }

        return $this->codes->redeem($this->codeKey($clientId), $code, $this->maxAttempts()) !== null;
    }

    /** Burns a pending code, if any. */
    public function consume(string $clientId): void
    {
        $this->codes->forget($this->codeKey($clientId));
    }

    private function maxAttempts(): int
    {
        return $this->settings->int(SettingKey::ClientPasswordResetMaxAttempts);
    }

    private function codeKey(string $clientId): string
    {
        return "password_reset_{$clientId}";
    }
}
