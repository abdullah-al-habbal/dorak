<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Services;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\StoreServiceCommand;
use Modules\Dashboard\Handlers\Services\StoreServiceHandler;
use Modules\Dashboard\Http\Requests\Business\ServiceRequest;
use Modules\Dashboard\Http\Resources\Shared\DashboardServiceResource;
use Modules\Dashboard\Support\DashboardActor;

final class StoreServiceAction extends BaseApiAction
{
    public function __construct(private readonly StoreServiceHandler $handler) {}

    public function __invoke(ServiceRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $attributes = $request->validated();

        Gate::forUser($actor)->authorize('dashboard.service.write', [$attributes['serviceable_type'], $attributes['serviceable_id']]);

        return $this->created(DashboardServiceResource::make(
            $this->handler->handle(new StoreServiceCommand($attributes))->load(['category', 'catalogItem.category']),
        ));
    }
}
