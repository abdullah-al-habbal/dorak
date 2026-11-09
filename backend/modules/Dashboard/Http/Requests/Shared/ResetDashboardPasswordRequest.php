<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Shared;

use Illuminate\Validation\Rule;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\Constants\DashboardPasswordResetConstants;
use Modules\Dashboard\CQRS\Command\ResetDashboardPasswordCommand;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;

final class ResetDashboardPasswordRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'actor_type' => ['required', 'string', Rule::enum(DashboardActorTypeEnum::class)],
            'email' => ['required', 'string', 'email', ValidationLimitConstants::RULE_SHORT_TEXT_MAX],
            'token' => ['required', 'string', ValidationLimitConstants::RULE_SHORT_TEXT_MAX],
            'password' => [
                'required',
                'string',
                DashboardPasswordResetConstants::DASHBOARD_PASSWORD_RULE_MIN,
                ValidationLimitConstants::RULE_PASSWORD_MAX,
                'confirmed',
            ],
        ];
    }

    public function toCommand(): ResetDashboardPasswordCommand
    {
        return new ResetDashboardPasswordCommand(
            actorType: DashboardActorTypeEnum::from((string) $this->validated('actor_type')),
            email: trim((string) $this->validated('email')),
            token: (string) $this->validated('token'),
            password: (string) $this->validated('password'),
        );
    }
}
