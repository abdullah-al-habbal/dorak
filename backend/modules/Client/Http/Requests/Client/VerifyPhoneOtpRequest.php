<?php

declare(strict_types=1);

namespace Modules\Client\Http\Requests\Client;

use Modules\Client\CQRS\Command\Client\VerifyPhoneOtpCommand;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class VerifyPhoneOtpRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'size:6'],
        ];
    }

    public function toCommand(): VerifyPhoneOtpCommand
    {
        return new VerifyPhoneOtpCommand(
            clientId: (string) $this->user()->id,
            code: $this->validated('code'),
        );
    }
}
