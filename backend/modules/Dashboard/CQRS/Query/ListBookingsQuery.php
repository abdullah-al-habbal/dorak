<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Query;

final readonly class ListBookingsQuery
{
    /** @param array<string, mixed> $filters */
    public function __construct(public ?string $branchId, public array $filters) {}
}
