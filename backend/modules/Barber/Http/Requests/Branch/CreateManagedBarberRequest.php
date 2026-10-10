<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Requests\Branch;

use Modules\Barber\CQRS\Command\Branch\CreateManagedBarberCommand;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Core\Support\PhoneNumberNormalizer;

final class CreateManagedBarberRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'array'],
            'name.en' => ['required', 'string', 'max:255'],
            'name.ar' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'regex:/^\+[1-9][0-9]{7,14}$/', 'unique:barbers,phone'],
            'chair_id' => ['nullable', 'uuid', 'exists:chairs,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('phone')) {
            $this->merge(['phone' => PhoneNumberNormalizer::normalize($this->string('phone')->toString())]);
        }
    }

    public function toCommand(string $branchId): CreateManagedBarberCommand
    {
        return new CreateManagedBarberCommand(
            $branchId,
            $this->normalizedName(),
            $this->string('phone')->toString(),
            $this->filled('chair_id') ? $this->string('chair_id')->toString() : null,
        );
    }

    /** @return array<string, string> */
    private function normalizedName(): array
    {
        $name = $this->array('name');
        $normalized = [];

        foreach ($name as $locale => $value) {
            if (! is_string($locale) || ! is_string($value)) {
                throw new \LogicException('Barber names must use string locale keys and values.');
            }

            $normalized[$locale] = $value;
        }

        return $normalized;
    }
}
