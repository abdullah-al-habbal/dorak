<?php

declare(strict_types=1);

namespace Modules\Branch\CQRS\Query\Shared;

use Carbon\Carbon;

final readonly class GetFloorPlanQuery
{
    public function __construct(
        public string $branchId,
        public Carbon $startsAt,
        public int $durationMinutes,
    ) {}
}
