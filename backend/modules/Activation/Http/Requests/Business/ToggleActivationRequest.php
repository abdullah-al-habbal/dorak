<?php

declare(strict_types=1);

namespace Modules\Activation\Http\Requests\Business;

use Modules\Activation\CQRS\Command\Business\ToggleActivationCommand;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class ToggleActivationRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'reason' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function toActivateCommand(string $activableId, string $activableType = 'barber'): ToggleActivationCommand
    {
        return new ToggleActivationCommand(
            activableId: $activableId,
            activableType: $activableType,
            activate: true,
            reason: $this->validated('reason') ? (string) $this->validated('reason') : null,
        );
    }

    public function toDeactivateCommand(string $activableId, string $activableType = 'barber'): ToggleActivationCommand
    {
        return new ToggleActivationCommand(
            activableId: $activableId,
            activableType: $activableType,
            activate: false,
            reason: $this->validated('reason') ? (string) $this->validated('reason') : null,
        );
    }
}
