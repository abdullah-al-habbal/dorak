<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Shared;

use Illuminate\Validation\Rule;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\Enums\DashboardActorTypeEnum;

final class DashboardLoginRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'actor_type' => ['required', 'string', Rule::enum(DashboardActorTypeEnum::class)],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', ValidationLimitConstants::RULE_PASSWORD_MAX],
        ];
    }
}
