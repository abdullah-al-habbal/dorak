<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Stylists;

use Illuminate\Http\JsonResponse;
use Modules\Barber\Http\Resources\Shared\BarberResource;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\UpdateStylistCommand;
use Modules\Dashboard\CQRS\Query\ShowStylistQuery;
use Modules\Dashboard\Handlers\Stylists\ShowStylistHandler;
use Modules\Dashboard\Handlers\Stylists\UpdateStylistHandler;
use Modules\Dashboard\Http\Requests\Business\UpdateStylistRequest;
use Modules\Dashboard\Services\DashboardWriteGuard;
use Modules\Dashboard\Support\DashboardActor;

final class UpdateStylistAction extends BaseApiAction
{
    public function __construct(
        private readonly BrandFeatures $brandFeatures,
        private readonly ShowStylistHandler $showHandler,
        private readonly UpdateStylistHandler $updateHandler,
        private readonly DashboardWriteGuard $writeGuard,
    ) {}

    public function __invoke(UpdateStylistRequest $request, string $stylist): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $scope = $actor->scopedBranchIds();
        $model = $this->showHandler->handle(new ShowStylistQuery($stylist, $scope));

        $this->brandFeatures->ensureBranchManageable($model->managed_by_branch_id);
        $this->brandFeatures->ensureChairBranchManageable($request->validated('chair_id'));
        $this->writeGuard->ensureBranchIdWritable($actor, $model->managed_by_branch_id);
        $this->writeGuard->ensureChairWritable($actor, $request->validated('chair_id'));

        return $this->updated(BarberResource::make($this->updateHandler->handle(
            $model,
            new UpdateStylistCommand($request->validated(), $scope),
        )));
    }
}
