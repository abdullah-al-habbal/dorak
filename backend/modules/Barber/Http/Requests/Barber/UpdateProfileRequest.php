<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Requests\Barber;

use Illuminate\Validation\Rule;
use Modules\Barber\CQRS\Command\Barber\UpdateProfileCommand;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Enums\VenueUniverse;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Core\Support\ProfileEmailChange;

final class UpdateProfileRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['nullable', 'array:en,ar'],
            'name.en' => ['sometimes', 'string', ValidationLimitConstants::RULE_NAME_MAX],
            'name.ar' => ['sometimes', 'string', ValidationLimitConstants::RULE_NAME_MAX],
            'bio' => ['nullable', 'array:en,ar'],
            'bio.en' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'bio.ar' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'email' => ['nullable', 'email', Rule::unique('barbers', 'email')->ignore($this->user()->id)],
            // A password has its own routes, which prove who is asking and end the other sessions (BG-61).
            'password' => ['missing'],
            'is_freelancer' => ['nullable', 'boolean'],
            'universe' => ['nullable', Rule::enum(VenueUniverse::class)],
            ...ProfileEmailChange::currentPasswordRules($this, 'barber'),
        ];
    }

    public function toCommand(): UpdateProfileCommand
    {
        return new UpdateProfileCommand(
            barberId: (string) $this->user()->id,
            name: $this->validated('name'),
            bio: $this->validated('bio'),
            email: $this->validated('email'),
            isFreelancer: $this->validated('is_freelancer'),
            universe: $this->validated('universe') === null ? null : VenueUniverse::from((string) $this->validated('universe')),
        );
    }
}
