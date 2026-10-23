<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Services;

use Illuminate\Http\JsonResponse;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\UpdateServiceCommand;
use Modules\Dashboard\CQRS\Query\ShowServiceQuery;
use Modules\Dashboard\Handlers\Services\ShowServiceHandler;
use Modules\Dashboard\Handlers\Services\UpdateServiceHandler;
use Modules\Dashboard\Http\Requests\ServiceRequest;
use Modules\Dashboard\Support\DashboardActor;
use Modules\OfferedService\Http\Resources\Shared\ServiceResource;

final class UpdateServiceAction extends BaseApiAction
{
    public function __construct(
        private readonly BrandFeatures $brandFeatures,
        private readonly ShowServiceHandler $showHandler,
        private readonly UpdateServiceHandler $updateHandler,
    ) {}

    public function __invoke(ServiceRequest $request, string $service): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $scope = $actor->scopedBranchIds();
        $model = $this->showHandler->handle(new ShowServiceQuery($service, $scope));
        $attributes = $request->validated();

        if (! $actor->isPlatformAdmin() && ($attributes['serviceable_type'] !== 'branch' || ! $actor->canAccessBranch($attributes['serviceable_id']))) {
            return $this->forbidden();
        }
        if ($attributes['serviceable_type'] === 'branch') {
            $this->brandFeatures->ensureBranchManageable($attributes['serviceable_id']);
        }

        return $this->updated(ServiceResource::make(
            $this->updateHandler->handle($model, new UpdateServiceCommand($attributes)),
        ));
    }
}
