<?php

declare(strict_types=1);

namespace Modules\Core\Http\Requests\Shared;

use Modules\Core\Http\Requests\BaseApiFormRequest;

final class RegisterDeviceTokenRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'token' => ['required', 'string', 'max:4096'],
            'platform' => ['required', 'in:android,ios,web'],
        ];
    }
}
