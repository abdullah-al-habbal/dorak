<?php

declare(strict_types=1);

namespace Modules\Core\Support;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Core\Constants\ValidationLimitConstants;

/** Password recovery goes to the account's email, so moving it takes the current password (BG-62). */
final class ProfileEmailChange
{
    /**
     * The `current_password` rules of a profile update. Empty unless the request moves the address.
     *
     * @return array<string, list<string>>
     */
    public static function currentPasswordRules(FormRequest $request, string $guard): array
    {
        $email = $request->input('email');

        // A change of letter case is the same mailbox.
        if (! is_string($email) || $email === '' || strcasecmp($email, (string) $request->user()?->email) === 0) {
            return [];
        }

        return ['current_password' => ['required', 'string', ValidationLimitConstants::RULE_PASSWORD_MAX, 'current_password:'.$guard]];
    }
}
