<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\ServiceCatalog\Constants\ServiceCatalogMediaConstants;
use Modules\ServiceCatalog\Enums\MediaTypeEnum;
use Modules\ServiceCatalog\Http\Requests\Admin\UploadCatalogItemMediaRequest;
use Modules\ServiceCatalog\Http\Resources\Shared\ServiceCatalogMediumResource;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

/** FT-12: stores an image on the public disk under a random name and attaches it to the item, last in order. */
final class UploadCatalogItemMediaAction extends BaseApiAction
{
    public function __invoke(UploadCatalogItemMediaRequest $request, string $id): JsonResponse
    {
        $item = ServiceCatalogItemModel::query()->findOrFail($id);
        Gate::forUser($request->user('admin_api'))->authorize('update', $item);

        if ($item->media()->count() >= ServiceCatalogMediaConstants::SERVICE_CATALOG_MEDIA_MAX_PER_ITEM) {
            return $this->unprocessable(errors: ['file' => [__('servicecatalog::messages.media_limit', ['max' => ServiceCatalogMediaConstants::SERVICE_CATALOG_MEDIA_MAX_PER_ITEM])]]);
        }

        $path = $request->file('file')->store(ServiceCatalogMediaConstants::SERVICE_CATALOG_MEDIA_DIRECTORY, 'public');
        $medium = $item->media()->create([
            'media_type' => MediaTypeEnum::Image,
            'image_path' => $path,
            'sort_order' => (int) $item->media()->max('sort_order') + 1,
        ]);

        return $this->created(new ServiceCatalogMediumResource($medium));
    }
}
