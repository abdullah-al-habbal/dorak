<?php

declare(strict_types=1);

namespace Modules\Client\Http\Requests\Client;

use Modules\Client\CQRS\Command\Client\RequestPhoneOtpCommand;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Core\Support\PhoneNumberNormalizer;

final class RequestPhoneOtpRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'phone' => ['required', 'string', 'regex:/^\+[0-9]{8,15}$/'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('phone')) {
            $this->merge(['phone' => PhoneNumberNormalizer::normalize($this->string('phone')->toString())]);
        }
    }

    public function toCommand(): RequestPhoneOtpCommand
    {
        return new RequestPhoneOtpCommand(
            clientId: (string) $this->user()->id,
            phone: $this->validated('phone'),
        );
    }
}
