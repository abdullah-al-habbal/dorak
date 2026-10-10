<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Stylists;

use Illuminate\Http\JsonResponse;
use Modules\Barber\Http\Resources\BarberResource;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\UpdateStylistCommand;
use Modules\Dashboard\CQRS\Query\ShowStylistQuery;
use Modules\Dashboard\Handlers\Stylists\ShowStylistHandler;
use Modules\Dashboard\Handlers\Stylists\UpdateStylistHandler;
use Modules\Dashboard\Http\Requests\UpdateStylistRequest;
use Modules\Dashboard\Support\DashboardActor;

final class UpdateStylistAction extends BaseApiAction
{
    public function __construct(
        private readonly ShowStylistHandler $showHandler,
        private readonly UpdateStylistHandler $updateHandler,
    ) {}

    public function __invoke(UpdateStylistRequest $request, string $stylist): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $scope = $actor->isPlatformAdmin() ? null : $actor->branchId;
        $model = $this->showHandler->handle(new ShowStylistQuery($stylist, $scope));

        return $this->updated(BarberResource::make($this->updateHandler->handle(
            $model,
            new UpdateStylistCommand($request->validated(), $scope),
        )));
    }
}
