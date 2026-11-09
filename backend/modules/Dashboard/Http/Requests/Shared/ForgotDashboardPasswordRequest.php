<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Shared;

use Illuminate\Validation\Rule;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\CQRS\Command\ForgotDashboardPasswordCommand;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;

final class ForgotDashboardPasswordRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'actor_type' => ['required', 'string', Rule::enum(DashboardActorTypeEnum::class)],
            'email' => ['required', 'string', 'email', ValidationLimitConstants::RULE_SHORT_TEXT_MAX],
        ];
    }

    public function toCommand(): ForgotDashboardPasswordCommand
    {
        return new ForgotDashboardPasswordCommand(
            actorType: DashboardActorTypeEnum::from((string) $this->validated('actor_type')),
            email: trim((string) $this->validated('email')),
            requestLocale: app()->getLocale(),
        );
    }
}
