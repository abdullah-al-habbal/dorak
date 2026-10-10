<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests;

use Modules\Core\Http\Requests\BaseApiFormRequest;

final class RescheduleBookingRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return ['ends_at' => ['required', 'date', 'after:time_slot'], 'time_slot' => ['required', 'date']];
    }
}
