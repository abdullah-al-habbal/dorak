<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Shared;

use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class RefreshSessionRequest extends BaseApiFormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'refresh_token' => ['required', 'string', 'min:32', ValidationLimitConstants::RULE_TOKEN_MAX],
            'claim' => ['sometimes', 'string', ValidationLimitConstants::RULE_TOKEN_MAX],
        ];
    }
}
