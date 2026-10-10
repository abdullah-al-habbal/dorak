<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Query;

final readonly class ShowServiceQuery
{
    public function __construct(public string $serviceId, public ?string $branchId) {}
}
