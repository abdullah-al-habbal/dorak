<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\CQRS\Query\Shared;

final readonly class ListCategoriesQuery
{
    public function __construct(
        public bool $includeInactive = false,
    ) {}
}
