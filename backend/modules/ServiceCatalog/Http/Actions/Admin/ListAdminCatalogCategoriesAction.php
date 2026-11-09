<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Actions\Admin;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\ServiceCatalog\Handlers\Admin\ListAdminCatalogCategoriesHandler;
use Modules\ServiceCatalog\Http\Requests\Admin\ListAdminCatalogCategoriesRequest;
use Modules\ServiceCatalog\Http\Resources\Admin\AdminCatalogCategoryResource;

/** `GET /dashboard/admin/catalog-categories`; the route group already admits platform admins only. */
final class ListAdminCatalogCategoriesAction extends BaseApiAction
{
    public function __construct(private readonly ListAdminCatalogCategoriesHandler $handler) {}

    public function __invoke(ListAdminCatalogCategoriesRequest $request): JsonResponse
    {
        return $this->ok(
            data: AdminCatalogCategoryResource::collection($this->handler->handle($request->toQuery()))->resolve($request),
        );
    }
}
