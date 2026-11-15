<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\ServiceCategories;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\StoreServiceCategoryCommand;
use Modules\Dashboard\Handlers\ServiceCategories\StoreServiceCategoryHandler;
use Modules\Dashboard\Http\Requests\Business\StoreServiceCategoryRequest;
use Modules\Dashboard\Http\Resources\Shared\DashboardServiceCategoryResource;
use Modules\Dashboard\Support\DashboardActor;

final class StoreServiceCategoryAction extends BaseApiAction
{
    public function __construct(private readonly StoreServiceCategoryHandler $handler) {}

    public function __invoke(StoreServiceCategoryRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        Gate::forUser($actor)->authorize('dashboard.serviceCategory.create');

        return $this->created(DashboardServiceCategoryResource::make(
            $this->handler->handle(new StoreServiceCategoryCommand($request->validated('name'))),
        ));
    }
}
