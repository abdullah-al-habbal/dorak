<?php

declare(strict_types=1);

namespace Modules\Currency\Http\Requests\Admin;

use Modules\Core\Http\Requests\BaseApiFormRequest;

final class SetCurrencyActiveRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return ['is_active' => ['required', 'boolean']];
    }
}
