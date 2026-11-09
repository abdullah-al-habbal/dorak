<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Handlers\Admin;

use Illuminate\Support\Facades\DB;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;
use Modules\ServiceCatalog\Support\CatalogCategoryUsage;

/** Soft-deletes an empty category; returns false (nothing deleted) while anything still uses it. */
final readonly class DeleteCatalogCategoryHandler
{
    public function __construct(private CatalogCategoryUsage $usage) {}

    public function handle(ServiceCatalogCategoryModel $category): bool
    {
        return DB::transaction(function () use ($category): bool {
            $locked = ServiceCatalogCategoryModel::query()->lockForUpdate()->findOrFail($category->getKey());
            if (! $this->usage->isEmpty($locked)) {
                return false;
            }

            return (bool) $locked->delete();
        });
    }
}
