<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\ServiceCatalog\Http\Requests\Admin\SaveCatalogTagRequest;
use Modules\ServiceCatalog\Http\Resources\Admin\AdminCatalogTagResource;
use Modules\ServiceCatalog\Models\ServiceCatalogItemTagModel;

final class UpdateCatalogTagAction extends BaseApiAction
{
    public function __invoke(SaveCatalogTagRequest $request, string $tag): JsonResponse
    {
        $model = ServiceCatalogItemTagModel::query()->findOrFail($tag);
        Gate::forUser($request->user('admin_api'))->authorize('update', $model);

        $model->update($request->validated());

        return $this->updated(data: new AdminCatalogTagResource($model->loadCount('items')), message: __('servicecatalog::messages.tag_saved'));
    }
}
