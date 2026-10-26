<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Shared;

use Illuminate\Validation\Rule;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class DashboardLoginRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'actor_type' => ['required', 'string', Rule::in(['admin', 'branch', 'barber', 'owner'])],
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ];
    }
}
