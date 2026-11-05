<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Services;

use Illuminate\Http\JsonResponse;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\UpdateServiceCommand;
use Modules\Dashboard\CQRS\Query\ShowServiceQuery;
use Modules\Dashboard\Handlers\Services\ShowServiceHandler;
use Modules\Dashboard\Handlers\Services\UpdateServiceHandler;
use Modules\Dashboard\Http\Requests\Business\ServiceRequest;
use Modules\Dashboard\Http\Resources\Shared\DashboardServiceResource;
use Modules\Dashboard\Support\DashboardActor;
use Modules\OfferedService\Enums\ServiceableTypeEnum;

final class UpdateServiceAction extends BaseApiAction
{
    public function __construct(
        private readonly ShowServiceHandler $showHandler,
        private readonly UpdateServiceHandler $updateHandler,
    ) {}

    public function __invoke(ServiceRequest $request, string $service): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $scope = $actor->scopedBrandIds();
        $model = $this->showHandler->handle(new ShowServiceQuery($service, $scope));
        $attributes = $request->validated();

        if (! $actor->isPlatformAdmin() && ($attributes['serviceable_type'] !== ServiceableTypeEnum::Brand->value || ! $actor->canManageBrandServices($attributes['serviceable_id']))) {
            return $this->forbidden();
        }

        return $this->updated(DashboardServiceResource::make(
            $this->updateHandler->handle($model, new UpdateServiceCommand($attributes))->load(['category', 'catalogItem.category']),
        ));
    }
}
