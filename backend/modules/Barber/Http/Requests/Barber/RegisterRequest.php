<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Requests\Barber;

use Illuminate\Validation\Rule;
use Modules\Barber\CQRS\Command\Barber\RegisterCommand;
use Modules\Barber\Models\BarberModel;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Core\Support\PhoneNumberNormalizer;

final class RegisterRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        // Same rule as the client sign-up: the email of a banned account is not reported as "taken".
        $bannedBarber = BarberModel::query()
            ->where('email', $this->input('email'))
            ->whereHas('bans', fn ($query) => $query
                ->where('banned_at', '<=', now())
                ->where(fn ($activeQuery) => $activeQuery
                    ->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now())
                )
            )
            ->first();
        $emailUnique = Rule::unique('barbers', 'email');

        if ($bannedBarber instanceof BarberModel) {
            $emailUnique->ignore($bannedBarber);
        }

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', $emailUnique],
            'password' => ['required', 'string', 'min:8', ValidationLimitConstants::RULE_PASSWORD_MAX, 'confirmed'],
            'is_freelancer' => ['sometimes', 'boolean'],
            'phone' => ['nullable', 'string', 'max:20', Rule::unique('barbers', 'phone')],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('phone')) {
            $this->merge(['phone' => PhoneNumberNormalizer::normalize($this->string('phone')->toString())]);
        }
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
