<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Catalog;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\ServiceCatalog\Models\ServiceCatalogItemTagModel;

final class ListCatalogTagsAction extends BaseApiAction
{
    public function __invoke(): JsonResponse
    {
        $tags = ServiceCatalogItemTagModel::query()->withCount('items')->orderBy('group_name')->orderBy('slug')->get()
            ->map(fn (ServiceCatalogItemTagModel $tag): array => [
                'id' => $tag->id,
                'name' => $tag->getTranslations('name'),
                'group_name' => $tag->group_name,
                'slug' => $tag->slug,
                'is_active' => $tag->is_active,
                'items_count' => $tag->items_count,
            ])->all();

        return $this->ok($tags);
    }
}
