<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\CQRS\Command\UpdateDashboardPasswordCommand;

final class UpdateDashboardPasswordRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:12', 'max:255', 'confirmed'],
        ];
    }

    public function toCommand(): UpdateDashboardPasswordCommand
    {
        return new UpdateDashboardPasswordCommand(
            currentPassword: (string) $this->validated('current_password'),
            password: (string) $this->validated('password'),
        );
    }
}
