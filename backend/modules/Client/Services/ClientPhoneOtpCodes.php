<?php

declare(strict_types=1);

namespace Modules\Client\Services;

use Modules\Client\Constants\ClientVerificationConstants;
use Modules\Core\Services\OneTimeCodes;
use Modules\Settings\Enums\SettingKey;
use Modules\Settings\Services\SettingsService;

/** The SMS code that confirms a client's phone number. It is bound to the number it was sent to. */
final class ClientPhoneOtpCodes
{
    private const string PHONE = 'phone';

    public function __construct(
        private readonly OneTimeCodes $codes,
        private readonly SettingsService $settings,
    ) {}

    public function issue(string $clientId, string $phone, string $code): void
    {
        $this->codes->issue($this->key($clientId), $code, now()->addMinutes(ClientVerificationConstants::CODE_TTL_MINUTES), [self::PHONE => $phone]);
    }

    /** The number a right code confirms, consuming the code; null means refused. */
    public function redeem(string $clientId, string $code): ?string
    {
        return $this->codes->redeem($this->key($clientId), $code, $this->settings->int(SettingKey::ClientPhoneOtpMaxAttempts))[self::PHONE] ?? null;
    }

    public function discard(string $clientId): void
    {
        $this->codes->forget($this->key($clientId));
    }

    private function key(string $clientId): string
    {
        return "phone_otp_{$clientId}";
    }
}
