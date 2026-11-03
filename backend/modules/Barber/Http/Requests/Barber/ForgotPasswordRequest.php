<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Requests\Barber;

use Modules\Barber\CQRS\Command\Barber\ForgotPasswordCommand;
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
