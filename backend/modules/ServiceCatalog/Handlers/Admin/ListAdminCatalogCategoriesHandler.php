<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Handlers\Admin;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Modules\ServiceCatalog\CQRS\Query\Admin\ListAdminCatalogCategoriesQuery;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;
use Modules\ServiceCatalog\Support\CatalogCategoryUsage;

/**
 * Admin-only list: top-level categories with usage counts and their (read-only) children.
 * Filters apply to the top level only. The public `/service-catalog/categories` list keeps its
 * own action and payload.
 */
final class ListAdminCatalogCategoriesHandler
{
    /** @return Collection<int, ServiceCatalogCategoryModel> */
    public function handle(ListAdminCatalogCategoriesQuery $query): Collection
    {
        $builder = CatalogCategoryUsage::withCounts(ServiceCatalogCategoryModel::query())
            ->whereNull('parent_id')
            ->with(['children' => fn ($children) => CatalogCategoryUsage::withCounts($children)->orderBy('sort_order')->orderBy('slug')])
            ->orderBy('sort_order')
            ->orderBy('slug');

        if ($query->status !== null) {
            $builder->where('is_active', $query->status->isActive());
        }

        if ($query->search !== '') {
            $term = '%'.$query->search.'%';
            $builder->where(fn (Builder $match) => $match
                ->where('name->en', 'like', $term)
                ->orWhere('name->ar', 'like', $term)
                ->orWhere('slug', 'like', $term));
        }

        return $builder->get();
    }
}
