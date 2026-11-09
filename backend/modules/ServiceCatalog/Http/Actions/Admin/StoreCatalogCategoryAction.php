<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\ServiceCatalog\Handlers\Admin\SaveCatalogCategoryHandler;
use Modules\ServiceCatalog\Http\Requests\Admin\SaveCatalogCategoryRequest;
use Modules\ServiceCatalog\Http\Resources\Admin\AdminCatalogCategoryResource;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;
use Modules\ServiceCatalog\Support\CatalogCategoryUsage;

final class StoreCatalogCategoryAction extends BaseApiAction
{
    public function __construct(private readonly SaveCatalogCategoryHandler $handler) {}

    public function __invoke(SaveCatalogCategoryRequest $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('create', ServiceCatalogCategoryModel::class);
        $category = $this->handler->create($request->toCommand());

        return $this->created(
            data: new AdminCatalogCategoryResource(CatalogCategoryUsage::findWithCounts((string) $category->getKey())),
            message: __('servicecatalog::messages.category_saved'),
        );
    }
}
