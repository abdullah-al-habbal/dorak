<?php

declare(strict_types=1);

namespace Modules\Core\Services;

use Illuminate\Support\Arr;
use Modules\Core\Constants\FcmNotificationConstants;

final class FcmInvalidTokenDetector
{
    /**
     * FCM answers INVALID_ARGUMENT for a bad payload as well as for a bad token, so that code
     * alone never condemns a token: the error also has to name the token.
     */
    public function isDeadToken(int $status, mixed $payload): bool
    {
        if ($status < 400 || ! is_array($payload) || ! is_array($payload['error'] ?? null)) {
            return false;
        }

        $error = $payload['error'];
        $codes = [$error['status'] ?? null, ...Arr::pluck($this->details($error), 'errorCode')];

        if (in_array(FcmNotificationConstants::FCM_NOTIFICATION_UNREGISTERED_CODE, $codes, true)) {
            return true;
        }

        return in_array(FcmNotificationConstants::FCM_NOTIFICATION_INVALID_ARGUMENT_CODE, $codes, true)
            && $this->blamesToken($error);
    }

    /**
     * @param  array<array-key, mixed>  $error
     */
    private function blamesToken(array $error): bool
    {
        foreach ($this->details($error) as $detail) {
            $violations = $detail['fieldViolations'] ?? null;
            $fields = is_array($violations) ? Arr::pluck($violations, 'field') : [];
            if (in_array(FcmNotificationConstants::FCM_NOTIFICATION_TOKEN_FIELD, $fields, true)) {
                return true;
            }
        }

        $message = $error['message'] ?? null;

        return is_string($message)
            && str_contains(strtolower($message), FcmNotificationConstants::FCM_NOTIFICATION_BAD_TOKEN_PHRASE);
    }

    /**
     * @param  array<array-key, mixed>  $error
     * @return list<array<array-key, mixed>>
     */
    private function details(array $error): array
    {
        $details = $error['details'] ?? null;

        return is_array($details) ? array_values(array_filter($details, is_array(...))) : [];
    }
}
