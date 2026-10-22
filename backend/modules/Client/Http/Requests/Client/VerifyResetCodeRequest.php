<?php

declare(strict_types=1);

namespace Modules\Client\Http\Requests\Client;

use Modules\Client\CQRS\Command\Client\VerifyResetCodeCommand;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class VerifyResetCodeRequest extends BaseApiFormRequest
{
    /**
     * No `exists` rule on the email: an unknown address must be rejected with
     * the same response as a wrong code so the route cannot enumerate accounts.
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'code' => ['required', 'string', 'size:6'],
        ];
    }

    public function toCommand(): VerifyResetCodeCommand
    {
        return new VerifyResetCodeCommand(
            email: (string) $this->validated('email'),
            code: (string) $this->validated('code'),
        );
    }
}
