<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Facades\DB;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;

/**
 * What keeps a category from being deleted: live child categories (any status), live catalog
 * items, and any offered service pointing at it directly or through one of its items (trashed
 * items included, since a service keeps its `catalog_item_id`). Offered services are never
 * soft-deleted, so every row counts. The admin list counts and every delete path use this.
 */
final class CatalogCategoryUsage
{
    private const string CATEGORIES = 'service_catalog_categories';

    private const string ITEMS = 'service_catalog_items';

    private const string OFFERED_SERVICES = 'offered_services';

    public const string SERVICES_COUNT = 'services_count';

    /**
     * @template TQuery of Builder<ServiceCatalogCategoryModel>|HasMany<ServiceCatalogCategoryModel, ServiceCatalogCategoryModel>
     *
     * @param  TQuery  $query  the list query, or the `children` relation of an eager load
     * @return TQuery
     */
    public static function withCounts(Builder|HasMany $query): Builder|HasMany
    {
        // withCount selects `service_catalog_categories.*` first, so the subquery is added beside it.
        return $query
            ->withCount(['items', 'children'])
            ->selectSub(self::offeredServices(self::CATEGORIES.'.id')->selectRaw('count(*)'), self::SERVICES_COUNT);
    }

    /** One category with the same counts as the admin list. */
    public static function findWithCounts(string $id): ServiceCatalogCategoryModel
    {
        return self::withCounts(ServiceCatalogCategoryModel::query())->findOrFail($id);
    }

    public function isEmpty(ServiceCatalogCategoryModel $category): bool
    {
        $id = (string) $category->getKey();

        return ! $category->children()->exists()
            && ! $category->items()->exists()
            && ! self::offeredServices(null, $id)->exists();
    }

    /** Offered services of a category given as a column reference (subquery) or a literal id. */
    private static function offeredServices(?string $categoryColumn, ?string $categoryId = null): QueryBuilder
    {
        $itemIds = DB::table(self::ITEMS)->select('id');
        $categoryColumn === null
            ? $itemIds->where('category_id', $categoryId)
            : $itemIds->whereColumn(self::ITEMS.'.category_id', $categoryColumn);

        return DB::table(self::OFFERED_SERVICES)->where(function (QueryBuilder $query) use ($categoryColumn, $categoryId, $itemIds): void {
            $categoryColumn === null
                ? $query->where('category_id', $categoryId)
                : $query->whereColumn(self::OFFERED_SERVICES.'.category_id', $categoryColumn);
            $query->orWhereIn('catalog_item_id', $itemIds);
        });
    }
}
