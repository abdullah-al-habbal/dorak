<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Laravel\Sanctum\PersonalAccessToken;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;
use Modules\Dashboard\Constants\DashboardPasswordResetConstants;
use Modules\Dashboard\CQRS\Command\UpdateDashboardPasswordCommand;
use Modules\Dashboard\Support\DashboardActor;

final class UpdateDashboardPasswordRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string', ValidationLimitConstants::RULE_PASSWORD_MAX],
            'password' => [
                'required',
                'string',
                DashboardPasswordResetConstants::DASHBOARD_PASSWORD_RULE_MIN,
                ValidationLimitConstants::RULE_PASSWORD_MAX,
                'confirmed',
            ],
            // Optional: the dashboard BFF sends the session's refresh token so that session stays signed in.
            'refresh_token' => ['sometimes', 'nullable', 'string', ValidationLimitConstants::RULE_SHORT_TEXT_MAX],
        ];
    }

    public function toCommand(DashboardActor $actor, ?PersonalAccessToken $currentToken): UpdateDashboardPasswordCommand
    {
        $refreshToken = $this->validated('refresh_token');

        return new UpdateDashboardPasswordCommand(
            currentPassword: (string) $this->validated('current_password'),
            password: (string) $this->validated('password'),
            actorType: $actor->actorType,
            keepAccessTokenId: $currentToken?->getKey(),
            keepRefreshToken: is_string($refreshToken) && $refreshToken !== '' ? $refreshToken : null,
        );
    }
}
