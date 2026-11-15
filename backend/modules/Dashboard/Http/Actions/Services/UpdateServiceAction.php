<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Services;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\UpdateServiceCommand;
use Modules\Dashboard\CQRS\Query\ShowServiceQuery;
use Modules\Dashboard\Handlers\Services\ShowServiceHandler;
use Modules\Dashboard\Handlers\Services\UpdateServiceHandler;
use Modules\Dashboard\Http\Requests\Business\ServiceRequest;
use Modules\Dashboard\Http\Resources\Shared\DashboardServiceResource;
use Modules\Dashboard\Services\DashboardWriteGuard;
use Modules\Dashboard\Support\DashboardActor;

final class UpdateServiceAction extends BaseApiAction
{
    public function __construct(
        private readonly ShowServiceHandler $showHandler,
        private readonly UpdateServiceHandler $updateHandler,
        private readonly DashboardWriteGuard $writeGuard,
    ) {}

    public function __invoke(ServiceRequest $request, string $service): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $scope = $actor->scopedBrandIds();
        $model = $this->showHandler->handle(new ShowServiceQuery($service, $scope));
        $attributes = $request->validated();

        Gate::forUser($actor)->authorize('dashboard.service.write', [$attributes['serviceable_type'], $attributes['serviceable_id']]);
        $this->writeGuard->ensureServiceableWritable($actor, $model->serviceable_type, $model->serviceable_id);
        $this->writeGuard->ensureServiceableWritable($actor, $attributes['serviceable_type'], $attributes['serviceable_id']);

        return $this->updated(DashboardServiceResource::make(
            $this->updateHandler->handle($model, new UpdateServiceCommand($attributes))->load(['category', 'catalogItem.category']),
        ));
    }
}
