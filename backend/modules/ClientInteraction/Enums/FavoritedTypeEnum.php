<?php

declare(strict_types=1);

namespace Modules\ClientInteraction\Enums;

use Modules\Barber\Models\BarberModel;
use Modules\Branch\Models\BranchModel;
use Modules\Brand\Models\BrandModel;
use Modules\Core\Contracts\MorphAliasEnum;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

enum FavoritedTypeEnum: string implements MorphAliasEnum
{
    case Brand = 'brand';
    case Branch = 'branch';
    case Barber = 'barber';
    case CatalogItem = 'catalog_item';

    public function modelClass(): string
    {
        return match ($this) {
            self::Brand => BrandModel::class,
            self::Branch => BranchModel::class,
            self::Barber => BarberModel::class,
            self::CatalogItem => ServiceCatalogItemModel::class,
        };
    }
}
