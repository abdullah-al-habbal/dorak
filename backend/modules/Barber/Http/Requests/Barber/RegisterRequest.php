<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Requests\Barber;

use Illuminate\Validation\Rule;
use Modules\Barber\CQRS\Command\Barber\RegisterCommand;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class RegisterRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('barbers', 'email')],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'is_freelancer' => ['sometimes', 'boolean'],
            'phone' => ['nullable', 'string', 'max:20'],
        ];
    }

    public function toCommand(): RegisterCommand
    {
        $phone = $this->validated('phone');

        return new RegisterCommand(
            name: (string) $this->validated('name'),
            email: (string) $this->validated('email'),
            password: (string) $this->validated('password'),
            isFreelancer: (bool) $this->validated('is_freelancer', true),
            phone: is_string($phone) ? $phone : null,
        );
    }
}
