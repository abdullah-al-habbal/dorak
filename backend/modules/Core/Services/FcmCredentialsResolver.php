<?php

declare(strict_types=1);

namespace Modules\Core\Services;

use Modules\Core\Enums\FcmConfigurationProblemEnum;

/** Reads the FCM service account from `services.fcm.credentials` (inline JSON or a file path). */
final class FcmCredentialsResolver
{
    /**
     * @return array{client_email: string, private_key: string}|FcmConfigurationProblemEnum
     */
    public function resolve(): array|FcmConfigurationProblemEnum
    {
        $configured = config('services.fcm.credentials');
        if (! is_string($configured) || $configured === '') {
            return FcmConfigurationProblemEnum::CredentialsMissing;
        }

        $json = str_starts_with(ltrim($configured), '{')
            ? $configured
            : (is_file($configured) ? file_get_contents($configured) : false);

        if (! is_string($json)) {
            return FcmConfigurationProblemEnum::CredentialsUnreadable;
        }

        $credentials = json_decode($json, true);

        if (! is_array($credentials)
            || ! is_string($credentials['client_email'] ?? null)
            || ! is_string($credentials['private_key'] ?? null)) {
            return FcmConfigurationProblemEnum::CredentialsInvalid;
        }

        return [
            'client_email' => $credentials['client_email'],
            'private_key' => $credentials['private_key'],
        ];
    }
}
