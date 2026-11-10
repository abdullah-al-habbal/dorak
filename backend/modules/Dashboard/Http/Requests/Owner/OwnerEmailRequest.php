<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Owner;

use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;

/** Public resend of the verification code: only the email is needed. */
final class OwnerEmailRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return ['email' => ['required', 'string', 'email', ValidationLimitConstants::RULE_SHORT_TEXT_MAX]];
    }

    public function email(): string
    {
        return mb_strtolower(trim((string) $this->validated('email')));
    }
}
