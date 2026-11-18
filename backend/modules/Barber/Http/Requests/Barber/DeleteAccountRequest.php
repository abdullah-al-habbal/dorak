<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Requests\Barber;

use Modules\Core\Constants\ValidationLimitConstants;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class DeleteAccountRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'password' => ['required', 'string', ValidationLimitConstants::RULE_PASSWORD_MAX],
        ];
    }
}
