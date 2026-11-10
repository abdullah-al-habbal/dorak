<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Owner;

use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\CQRS\Command\VerifyOwnerEmailCommand;

final class VerifyOwnerEmailRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', ValidationLimitConstants::RULE_SHORT_TEXT_MAX],
            'code' => ['required', 'string', 'digits:6'],
        ];
    }

    public function toCommand(): VerifyOwnerEmailCommand
    {
        return new VerifyOwnerEmailCommand(
            email: mb_strtolower(trim((string) $this->validated('email'))),
            code: (string) $this->validated('code'),
        );
    }
}
