<?php

declare(strict_types=1);

namespace Modules\Dashboard\Eloquent\Resolvers\ServiceCategories;

use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;
use Modules\ServiceCatalog\Support\CatalogCategorySlugGenerator;

final readonly class StoreServiceCategoryEloquentResolver
{
    public function __construct(private CatalogCategorySlugGenerator $slugs) {}

    /** @param array{en: string, ar: string} $name */
    public function resolve(array $name): ServiceCatalogCategoryModel
    {
        return ServiceCatalogCategoryModel::query()->create([
            'name' => $name,
            'slug' => $this->slugs->generate($name['en']),
            'is_active' => true,
        ]);
    }
}
