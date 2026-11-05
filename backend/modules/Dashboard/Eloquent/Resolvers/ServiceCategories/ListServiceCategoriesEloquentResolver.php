<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\ServiceCategories;

use Illuminate\Database\Eloquent\Collection;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;

final class ListServiceCategoriesEloquentResolver
{
    /** @return Collection<int, ServiceCatalogCategoryModel> */
    public function resolve(): Collection
    {
        return ServiceCatalogCategoryModel::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('slug')
            ->get();
    }
}
