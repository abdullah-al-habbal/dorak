<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Eloquent\Resolvers\Shared;

use Illuminate\Database\Eloquent\Collection;
use Modules\ServiceCatalog\CQRS\Query\Shared\ListCategoriesQuery;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;

final class ListCategoriesEloquentResolver
{
    public function resolve(ListCategoriesQuery $payload): Collection
    {
        $builder = ServiceCatalogCategoryModel::query()
            ->whereNull('parent_id')
            ->with('children')
            ->orderBy('sort_order');

        if (! $payload->includeInactive) {
            $builder->where('is_active', true);
        }

        return $builder->get();
    }
}
