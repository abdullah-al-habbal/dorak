<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Requests\Barber;

use Illuminate\Validation\Rule;
use Modules\Barber\Models\BarberModel;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Core\Support\PhoneNumberNormalizer;

/** A rejected barber cannot hold a token, so they prove who they are with their credentials and may fix their profile. */
final class ResubmitRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $own = BarberModel::query()->where('email', $this->input('email'))->value('id');

        return [
            'email' => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', ValidationLimitConstants::RULE_PASSWORD_MAX],
            'name' => ['nullable', 'array:en,ar'],
            'name.en' => ['sometimes', 'string', ValidationLimitConstants::RULE_NAME_MAX],
            'name.ar' => ['sometimes', 'string', ValidationLimitConstants::RULE_NAME_MAX],
            'bio' => ['nullable', 'array:en,ar'],
            'bio.en' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'bio.ar' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'phone' => ['nullable', 'string', 'max:20', Rule::unique('barbers', 'phone')->ignore($own)],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('phone')) {
            $this->merge(['phone' => PhoneNumberNormalizer::normalize($this->string('phone')->toString())]);
        }
    }

    /** @return array<string, mixed> */
    public function profileFixes(): array
    {
        return array_filter(
            $this->safe()->only(['name', 'bio', 'phone']),
            static fn (mixed $value): bool => $value !== null,
        );
    }
}
