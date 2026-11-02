<?php

declare(strict_types=1);

namespace Modules\Core\Http\Requests\Shared;

use Illuminate\Validation\Rule;
use Modules\Core\Enums\DevicePlatformEnum;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class RegisterDeviceTokenRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'token' => ['required', 'string', 'max:4096'],
            'platform_type' => ['required', Rule::enum(DevicePlatformEnum::class)],
        ];
    }
}
