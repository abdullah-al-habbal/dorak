<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\CQRS\Query\Admin;

use Modules\ServiceCatalog\Enums\CatalogCategoryStatusFilterEnum;

final readonly class ListAdminCatalogCategoriesQuery
{
    public function __construct(
        public ?CatalogCategoryStatusFilterEnum $status,
        public string $search,
    ) {}
}
