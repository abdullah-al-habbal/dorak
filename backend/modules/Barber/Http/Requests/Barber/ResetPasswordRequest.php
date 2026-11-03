<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Requests\Barber;

use Modules\Barber\CQRS\Command\Barber\ResetPasswordCommand;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ResetPasswordRequest extends BaseApiFormRequest
{
    /**
     * No `exists` rule: an unknown email fails exactly like a wrong code.
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:6'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    public function toCommand(): ResetPasswordCommand
    {
        return new ResetPasswordCommand(
            email: (string) $this->validated('email'),
            code: (string) $this->validated('code'),
            password: (string) $this->validated('password'),
        );
    }
}
