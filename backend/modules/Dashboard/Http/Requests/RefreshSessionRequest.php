<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests;

use Modules\Core\Http\Requests\BaseApiFormRequest;

final class RefreshSessionRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'refresh_token' => ['required', 'string', 'min:32'],
        ];
    }
}
