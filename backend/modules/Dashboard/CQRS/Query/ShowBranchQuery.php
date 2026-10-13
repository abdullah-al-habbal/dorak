<?php

declare(strict_types=1);

namespace Modules\Dashboard\CQRS\Query;

final readonly class ShowBranchQuery
{
    public function __construct(public string $id, public ?string $scopeBrandId, public ?string $scopeBranchId = null) {}
}
