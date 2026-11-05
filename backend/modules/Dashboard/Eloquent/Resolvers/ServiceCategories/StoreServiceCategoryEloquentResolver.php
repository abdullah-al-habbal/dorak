<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\ServiceCategories;

use Illuminate\Support\Str;
use Modules\Dashboard\Constants\DashboardServiceCategoryConstants;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;

final class StoreServiceCategoryEloquentResolver
{
    /** @param array{en: string, ar: string} $name */
    public function resolve(array $name): ServiceCatalogCategoryModel
    {
        return ServiceCatalogCategoryModel::query()->create([
            'name' => $name,
            'slug' => Str::slug($name['en']).'-'.Str::lower(Str::random(DashboardServiceCategoryConstants::DASHBOARD_SERVICE_CATEGORY_SLUG_SUFFIX_LENGTH)),
            'is_active' => true,
        ]);
    }
}
