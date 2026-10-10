<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Query;

final readonly class ShowBookingQuery
{
    public function __construct(public string $bookingId, public ?string $branchId) {}
}
