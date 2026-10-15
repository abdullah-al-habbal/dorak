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
            'starts_at' => ['required', 'date', 'regex:/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|\+00:00)$/', 'after_or_equal:now'],
            'duration' => ['required', 'integer', 'min:1', 'max:480'],
        ];
    }

    public function toQuery(string $branchId): GetFloorPlanQuery
    {
        return new GetFloorPlanQuery(
            branchId: $branchId,
            startsAt: Carbon::parse($this->string('starts_at')->toString())->utc(),
            durationMinutes: $this->integer('duration'),
        );
    }
}
