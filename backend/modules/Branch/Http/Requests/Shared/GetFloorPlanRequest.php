<?php

declare(strict_types=1);

namespace Modules\Branch\Http\Requests\Shared;

use Carbon\Carbon;
use Modules\Branch\CQRS\Query\Shared\GetFloorPlanQuery;
use Modules\Core\Http\Requests\BaseApiFormRequest;

final class GetFloorPlanRequest extends BaseApiFormRequest
{
    public function rules(): array
    {
        return [
            'date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'time_slot' => ['required', 'date_format:H:i'],
            'duration' => ['required', 'integer', 'min:1', 'max:480'],
        ];
    }

    public function toQuery(string $branchId): GetFloorPlanQuery
    {
        return new GetFloorPlanQuery(
            branchId: $branchId,
            startsAt: Carbon::createFromFormat(
                'Y-m-d H:i',
                $this->validated('date').' '.$this->validated('time_slot'),
            ),
            durationMinutes: (int) $this->validated('duration'),
        );
    }
}
