<?php

declare(strict_types=1);

namespace Modules\ServiceCatalog\Http\Actions\Client;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\ServiceCatalog\CQRS\Command\Client\DeleteCatalogItemCommand;
use Modules\ServiceCatalog\Handlers\Client\DeleteCatalogItemHandler;
use Modules\ServiceCatalog\Models\ServiceCatalogItemModel;

final class DeleteCatalogItemAction extends BaseApiAction
{
    public function __construct(
        private readonly DeleteCatalogItemHandler $handler,
    ) {}

    public function __invoke(Request $request, string $id): JsonResponse
    {
        $item = ServiceCatalogItemModel::query()->findOrFail($id);
        Gate::forUser($request->user())->authorize('delete', $item);
        $command = new DeleteCatalogItemCommand($id);
        $this->handler->handle($command);

        return $this->noContent();
    }
}
