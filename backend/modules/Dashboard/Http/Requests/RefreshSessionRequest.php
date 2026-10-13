<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests;

use Modules\Core\Http\Requests\BaseApiFormRequest;

final class RefreshSessionRequest extends BaseApiFormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'refresh_token' => ['required', 'string', 'min:32'],
            'claim' => ['sometimes', 'string'],
        ];
    }
}
