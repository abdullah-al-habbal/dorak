<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Query;

final readonly class ListBranchesQuery
{
    public function __construct(public ?string $brandId, public int $perPage) {}
}
