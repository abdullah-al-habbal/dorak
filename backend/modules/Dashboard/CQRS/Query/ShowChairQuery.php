<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Query;

final readonly class ShowChairQuery
{
    public function __construct(public string $chairId, public ?string $branchId) {}
}
