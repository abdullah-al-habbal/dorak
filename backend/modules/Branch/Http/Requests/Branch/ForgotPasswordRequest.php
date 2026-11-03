<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Requests\Branch;

use Modules\Branch\CQRS\Command\Branch\ForgotPasswordCommand;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ForgotPasswordRequest extends BaseApiFormRequest
{
    /**
     * No `exists` rule: the response must not reveal whether an email is registered.
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
