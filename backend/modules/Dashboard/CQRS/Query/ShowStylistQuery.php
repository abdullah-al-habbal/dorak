<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Query;

final readonly class ShowStylistQuery
{
    public function __construct(public string $stylistId, public ?string $branchId) {}
}
