<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\ServiceCatalog\Handlers\Client\CreateCatalogItemHandler;
use Modules\ServiceCatalog\Http\Requests\Client\CreateCatalogItemRequest;
use Modules\ServiceCatalog\Http\Resources\Shared\ServiceCatalogItemResource;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

final class CreateCatalogItemAction extends BaseApiAction
{
    public function __construct(
        private readonly CreateCatalogItemHandler $handler,
    ) {}

    public function __invoke(CreateCatalogItemRequest $request): JsonResponse
    {
        Gate::forUser($request->user('admin_api'))->authorize('create', ServiceCatalogItemModel::class);
        $item = $this->handler->handle($request->toCommand());

        $item->load(['category', 'tags', 'media']);

        return $this->created(
            data: new ServiceCatalogItemResource($item),
        );
    }
}
