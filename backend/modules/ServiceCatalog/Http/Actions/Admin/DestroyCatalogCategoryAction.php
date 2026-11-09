<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Enums\ErrorCodeEnum;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\ServiceCatalog\Handlers\Admin\DeleteCatalogCategoryHandler;
use Modules\ServiceCatalog\Models\ServiceCatalogCategoryModel;

/** Deletes an empty category only; one still in use answers 409 so the admin can deactivate it instead. */
final class DestroyCatalogCategoryAction extends BaseApiAction
{
    public function __construct(private readonly DeleteCatalogCategoryHandler $handler) {}

    public function __invoke(Request $request, string $category): JsonResponse
    {
        $model = ServiceCatalogCategoryModel::query()->findOrFail($category);
        Gate::forUser($request->user('admin_api'))->authorize('delete', $model);

        if (! $this->handler->handle($model)) {
            return $this->businessError(ErrorCodeEnum::CONFLICT, __('servicecatalog::messages.category_in_use'));
        }

        return $this->deleted(message: __('servicecatalog::messages.category_deleted'));
    }
}
