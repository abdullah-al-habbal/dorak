<?php

declare(strict_types=1);

namespace Modules\Client\Http\Requests\Client;

use Illuminate\Validation\Rule;
use Modules\Client\CQRS\Command\Client\UpdateProfileCommand;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Core\Support\PhoneNumberNormalizer;

final class UpdateProfileRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', Rule::unique('clients', 'email')->ignore($this->user()->id)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:20'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('phone')) {
            $this->merge(['phone' => PhoneNumberNormalizer::normalize($this->string('phone')->toString())]);
        }
    }

    public function toCommand(): UpdateProfileCommand
    {
        return new UpdateProfileCommand(
            clientId: (string) $this->user()->id,
            name: $this->validated('name'),
            email: $this->validated('email'),
            password: $this->validated('password'),
            phone: $this->validated('phone'),
        );
    }
}
