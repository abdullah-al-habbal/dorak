<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Query;

use Modules\Booking\Enums\BookingStatus;

final readonly class ListScheduleAppointmentsQuery
{
    public function __construct(
        public string $barberId,
        public int $perPage,
        public ?BookingStatus $status = null,
        public ?string $dateFrom = null,
        public ?string $dateTo = null,
    ) {}
}
