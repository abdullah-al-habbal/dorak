<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Enums;

use Modules\Core\Contracts\MorphAliasEnum;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

enum MediableTypeEnum: string implements MorphAliasEnum
{
    case CatalogItem = 'catalog_item';
    case CatalogCategory = 'catalog_category';

    public function label(): string
    {
        return $this->value;
    }

    public function modelClass(): string
    {
        return match ($this) {
            self::CatalogItem => ServiceCatalogItemModel::class,
            self::CatalogCategory => ServiceCatalogCategoryModel::class,
        };
    }
}
