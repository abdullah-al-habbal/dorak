<?php

declare(strict_types=1);

namespace Modules\Booking\CQRS\Query\Shared;

use Carbon\Carbon;

final readonly class ListSlotsQuery
{
    /**
     * @param  list<string>  $serviceIds
     */
    public function __construct(
        public Carbon $date,
        public array $serviceIds,
        public ?string $branchId = null,
        public ?string $chairId = null,
        public ?string $barberId = null,
    ) {}
}
