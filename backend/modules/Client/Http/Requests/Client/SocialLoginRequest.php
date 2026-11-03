<?php

declare(strict_types=1);

namespace Modules\Client\Http\Requests\Client;

use Modules\Client\CQRS\Command\Client\SocialLoginCommand;
use Modules\Client\Enums\SocialProviderEnum;
use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class SocialLoginRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'access_token' => ['required', 'string', 'min:10', ValidationLimitConstants::RULE_TOKEN_MAX],
        ];
    }

    public function toCommand(SocialProviderEnum $provider): SocialLoginCommand
    {
        return new SocialLoginCommand(
            provider: $provider,
            accessToken: $this->validated('access_token'),
        );
    }
}
