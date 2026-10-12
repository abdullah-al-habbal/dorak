<?php

declare(strict_types=1);

namespace Modules\Client\Http\Requests\Client;

use Illuminate\Validation\Rule;
use Modules\Client\CQRS\Command\Client\RegisterCommand;
use Modules\Client\Models\ClientModel;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Core\Support\PhoneNumberNormalizer;

final class RegisterRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        $bannedClient = ClientModel::query()
            ->where('email', $this->input('email'))
            ->whereHas('bans', fn ($query) => $query
                ->where('banned_from', '<=', now())
                ->where(fn ($activeQuery) => $activeQuery
                    ->whereNull('banned_until')
                    ->orWhere('banned_until', '>', now())
                )
            )
            ->first();
        $emailUnique = Rule::unique('clients', 'email');

        if ($bannedClient instanceof ClientModel) {
            $emailUnique->ignore($bannedClient);
        }

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', $emailUnique],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:20'],
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
        return new RegisterCommand(
            name: $this->validated('name'),
            email: $this->validated('email'),
            password: $this->validated('password'),
            phone: $this->validated('phone'),
        );
    }
}
