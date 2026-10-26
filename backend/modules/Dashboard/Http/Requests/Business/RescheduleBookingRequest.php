<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Requests\Business;

use Modules\Core\Http\Requests\BaseApiFormRequest;

final class RescheduleBookingRequest extends BaseApiFormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        $utcTimestamp = ['required', 'date', 'regex:/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|\+00:00)$/'];

        return [
            'ends_at' => [...$utcTimestamp, 'after:time_slot'],
            'time_slot' => $utcTimestamp,
        ];
    }
}
