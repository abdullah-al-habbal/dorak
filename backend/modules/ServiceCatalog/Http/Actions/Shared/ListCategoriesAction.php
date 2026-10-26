<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Actions\Shared;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\ServiceCatalog\CQRS\Query\Shared\ListCategoriesQuery;
use Modules\ServiceCatalog\Handlers\Shared\ListCategoriesHandler;
use Modules\ServiceCatalog\Http\Resources\Shared\ServiceCatalogCategoryResource;

final class ListCategoriesAction extends BaseApiAction
{
    public function __construct(
        private readonly ListCategoriesHandler $handler,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $query = new ListCategoriesQuery(includeInactive: $request->user('admin_api') !== null);
        $categories = $this->handler->handle($query);

        return $this->ok(
            data: ServiceCatalogCategoryResource::collection($categories)->resolve($request),
        );
    }
}
