<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Enums;

/** The admin catalog list's status filter; absent means every status. */
enum CatalogCategoryStatusFilterEnum: string
{
    case Active = 'active';
    case Inactive = 'inactive';

    public function isActive(): bool
    {
        return $this === self::Active;
    }
}
