<?php

declare(strict_types=1);

namespace Modules\Client\Http\Requests\Client;

use Modules\Client\CQRS\Command\Client\ResetPasswordCommand;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ResetPasswordRequest extends BaseApiFormRequest
{
    /**
     * No `exists` rule: an unknown email must answer like a known one (T11.3).
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:6'],
            'password' => ['required', 'string', 'min:8', ValidationLimitConstants::RULE_PASSWORD_MAX, 'confirmed'],
        ];
    }

    public function toCommand(): ResetPasswordCommand
    {
        return new ResetPasswordCommand(
            email: $this->validated('email'),
            code: $this->validated('code'),
            password: $this->validated('password'),
        );
    }
}
