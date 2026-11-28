<?php

declare(strict_types=1);

namespace Modules\Client\Http\Requests\Client;

use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;
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
            // A password has its own routes, which prove who is asking and end the other sessions (BG-61).
            'password' => ['missing'],
            'phone' => ['nullable', 'string', 'max:20'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('phone')) {
            $this->merge(['phone' => PhoneNumberNormalizer::normalize($this->string('phone')->toString())]);
        }
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $phone = $this->input('phone');

            if ($phone !== null && $phone !== $this->user()->phone) {
                $validator->errors()->add('phone', __('core::messages.phone_change_requires_otp'));
            }
        });
    }

    public function toCommand(): UpdateProfileCommand
    {
        return new UpdateProfileCommand(
            clientId: (string) $this->user()->id,
            name: $this->validated('name'),
            email: $this->validated('email'),
        );
    }
}
