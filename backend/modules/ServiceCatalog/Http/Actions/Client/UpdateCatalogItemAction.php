<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\ServiceCatalog\Handlers\Client\UpdateCatalogItemHandler;
use Modules\ServiceCatalog\Http\Requests\Client\UpdateCatalogItemRequest;
use Modules\ServiceCatalog\Http\Resources\Shared\ServiceCatalogItemResource;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

final class UpdateCatalogItemAction extends BaseApiAction
{
    public function __construct(
        private readonly UpdateCatalogItemHandler $handler,
    ) {}

    public function __invoke(string $id, UpdateCatalogItemRequest $request): JsonResponse
    {
        $item = ServiceCatalogItemModel::query()->findOrFail($id);
        Gate::forUser($request->user())->authorize('update', $item);
        $command = $request->toCommand($id);
        $item = $this->handler->handle($command);

        return $this->ok(
            data: new ServiceCatalogItemResource($item),
        );
    }
}
