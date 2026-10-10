<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Query;

final readonly class ListServicesQuery
{
    public function __construct(public ?string $branchId, public int $perPage) {}
}
