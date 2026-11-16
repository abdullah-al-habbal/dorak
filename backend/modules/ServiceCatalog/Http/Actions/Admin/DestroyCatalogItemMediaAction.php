<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

/** FT-12: removes one image of an item and its file. The medium is looked up through the item, so another item's image is a 404. */
final class DestroyCatalogItemMediaAction extends BaseApiAction
{
    public function __invoke(Request $request, string $id, string $media): JsonResponse
    {
        $item = ServiceCatalogItemModel::query()->findOrFail($id);
        Gate::forUser($request->user('admin_api'))->authorize('update', $item);

        $medium = $item->media()->findOrFail($media);
        Storage::disk('public')->delete($medium->image_path);
        $medium->delete();

        return $this->noContent();
    }
}
