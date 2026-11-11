<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\ServiceCatalog\Models\ServiceCatalogItemTagModel;

/** Removes a tag; items that carried it simply stop showing it (the tag is soft-deleted, so its history is kept). */
final class DestroyCatalogTagAction extends BaseApiAction
{
    public function __invoke(Request $request, string $tag): JsonResponse
    {
        $model = ServiceCatalogItemTagModel::query()->findOrFail($tag);
        Gate::forUser($request->user('admin_api'))->authorize('delete', $model);

        $model->delete();

        return $this->deleted(message: __('servicecatalog::messages.tag_deleted'));
    }
}
