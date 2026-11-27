<?php

declare(strict_types=1);

namespace Modules\Client\Services;

use Modules\Client\Constants\ClientVerificationConstants;
use Modules\Core\Services\OneTimeCodes;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

/** The code that confirms a client's email address. */
final class ClientEmailVerificationCodes
{
    public function __construct(
        private readonly OneTimeCodes $codes,
        private readonly SettingsService $settings,
    ) {}

    public function issue(string $clientId, string $code): void
    {
        $this->codes->issue($this->key($clientId), $code, now()->addMinutes(ClientVerificationConstants::CODE_TTL_MINUTES));
    }

    /** Whether the code is right, consuming it. A wrong guess is counted. */
    public function redeem(string $clientId, string $code): bool
    {
        return $this->codes->redeem($this->key($clientId), $code, $this->settings->int(SettingKey::ClientEmailVerificationMaxAttempts)) !== null;
    }

    /** Refuses a guess that has no pending account behind it, at the cost of a real comparison. */
    public function refuse(string $code): void
    {
        $this->codes->refuse($code);
    }

    private function key(string $clientId): string
    {
        return "email_verify_{$clientId}";
    }
}
