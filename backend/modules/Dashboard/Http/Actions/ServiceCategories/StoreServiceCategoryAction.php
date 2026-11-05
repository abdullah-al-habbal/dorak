<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\ServiceCategories;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\StoreServiceCategoryCommand;
use Modules\Dashboard\Handlers\ServiceCategories\StoreServiceCategoryHandler;
use Modules\Dashboard\Http\Requests\Business\StoreServiceCategoryRequest;
use Modules\Dashboard\Http\Resources\Shared\DashboardServiceCategoryResource;

final class StoreServiceCategoryAction extends BaseApiAction
{
    public function __construct(private readonly StoreServiceCategoryHandler $handler) {}

    public function __invoke(StoreServiceCategoryRequest $request): JsonResponse
    {
        return $this->created(DashboardServiceCategoryResource::make(
            $this->handler->handle(new StoreServiceCategoryCommand($request->validated('name'))),
        ));
    }
}
