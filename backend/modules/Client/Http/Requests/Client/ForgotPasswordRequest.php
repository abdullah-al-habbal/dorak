<?php

declare(strict_types=1);

namespace Modules\Client\Http\Requests\Client;

use Modules\Client\CQRS\Command\Client\ForgotPasswordCommand;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ForgotPasswordRequest extends BaseApiFormRequest
{
    /**
     * No `exists` rule: an unknown email must answer like a known one (T11.3).
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
        ];
    }

    public function toCommand(): ForgotPasswordCommand
    {
        return new ForgotPasswordCommand(
            email: (string) $this->validated('email'),
        );
    }
}
