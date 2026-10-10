<?php

declare(strict_types=1);

namespace Modules\Barber\Http\Requests\Barber;

use Modules\Core\Http\Requests\BaseApiFormRequest;

final class UpdateWorkstationStatusRequest extends BaseApiFormRequest
{
    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return ['online' => ['required', 'boolean']];
    }
}
