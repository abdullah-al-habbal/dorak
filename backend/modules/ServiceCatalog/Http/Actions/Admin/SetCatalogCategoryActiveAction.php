<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\ServiceCatalog\Http\Requests\Admin\SetCatalogCategoryActiveRequest;
use Modules\ServiceCatalog\Http\Resources\Admin\AdminCatalogCategoryResource;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;
use Modules\ServiceCatalog\Support\CatalogCategoryUsage;

/** Toggles one category only: children keep their own status (no cascade). */
final class SetCatalogCategoryActiveAction extends BaseApiAction
{
    public function __invoke(SetCatalogCategoryActiveRequest $request, string $category): JsonResponse
    {
        $model = ServiceCatalogCategoryModel::query()->findOrFail($category);
        Gate::forUser($request->user('admin_api'))->authorize('update', $model);
        $model->update(['is_active' => $request->boolean('is_active')]);

        return $this->updated(
            data: new AdminCatalogCategoryResource(CatalogCategoryUsage::findWithCounts($category)),
            message: __('servicecatalog::messages.category_saved'),
        );
    }
}
