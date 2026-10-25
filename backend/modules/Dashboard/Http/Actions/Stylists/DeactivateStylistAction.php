<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Stylists;

use Illuminate\Http\JsonResponse;
use Modules\Activation\Handlers\Business\ToggleActivationHandler;
use Modules\Activation\Http\Requests\Business\ToggleActivationRequest;
use Modules\Barber\Http\Resources\BarberResource;
use Modules\Brand\Services\BrandFeatures;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ShowStylistQuery;
use Modules\Dashboard\Handlers\Stylists\ShowStylistHandler;
use Modules\Dashboard\Support\DashboardActor;

final class DeactivateStylistAction extends BaseApiAction
{
    public function __construct(
        private readonly BrandFeatures $brandFeatures,
        private readonly ShowStylistHandler $showHandler,
        private readonly ToggleActivationHandler $toggleHandler,
    ) {}

    public function __invoke(ToggleActivationRequest $request, string $stylist): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $model = $this->showHandler->handle(new ShowStylistQuery($stylist, $actor->scopedBranchIds()));

        $this->brandFeatures->ensureBranchManageable($model->managed_by_branch_id);
        $this->toggleHandler->handle($request->toDeactivateCommand($model->getKey()));

        return $this->ok(BarberResource::make($model->refresh()));
    }
}
