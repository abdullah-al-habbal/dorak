<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Chairs;

use Illuminate\Http\JsonResponse;
use Modules\Chair\Http\Resources\Shared\ChairResource;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\UpdateChairCommand;
use Modules\Dashboard\CQRS\Query\ShowChairQuery;
use Modules\Dashboard\Eloquent\Resolvers\Chairs\ChairHasActiveBookingsException;
use Modules\Dashboard\Handlers\Chairs\ShowChairHandler;
use Modules\Dashboard\Handlers\Chairs\UpdateChairHandler;
use Modules\Dashboard\Http\Requests\ChairRequest;
use Modules\Dashboard\Support\DashboardActor;

final class UpdateChairAction extends BaseApiAction
{
    public function __construct(
        private readonly ShowChairHandler $showHandler,
        private readonly UpdateChairHandler $updateHandler,
    ) {}

    public function __invoke(ChairRequest $request, string $chair): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $scope = $actor->isPlatformAdmin() ? null : $actor->branchId;
        $model = $this->showHandler->handle(new ShowChairQuery($chair, $scope));
        $attributes = $request->validated();

        if (! $actor->isPlatformAdmin() && $attributes['branch_id'] !== $actor->branchId) {
            return $this->forbidden();
        }

        try {
            $updated = $this->updateHandler->handle($model, new UpdateChairCommand($attributes, $scope));
        } catch (ChairHasActiveBookingsException $exception) {
            return $this->error('CHAIR_HAS_ACTIVE_BOOKINGS', $exception->getMessage(), 409);
        }

        return $updated === null
            ? $this->forbidden('The barber belongs to another branch.')
            : $this->updated(ChairResource::make($updated));
    }
}
