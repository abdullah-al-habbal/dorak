<?php

declare(strict_types=1);

namespace Modules\Dashboard\Handlers\ServiceCategories;

use Illuminate\Database\Eloquent\Collection;
use Modules\Dashboard\Eloquent\Resolvers\ServiceCategories\ListServiceCategoriesEloquentResolver;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;

final readonly class ListServiceCategoriesHandler
{
    public function __construct(private ListServiceCategoriesEloquentResolver $resolver) {}

    /** @return Collection<int, ServiceCatalogCategoryModel> */
    public function handle(): Collection
    {
        return $this->resolver->resolve();
    }
}
