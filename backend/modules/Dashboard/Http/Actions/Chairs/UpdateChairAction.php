<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Chairs;

use Illuminate\Http\JsonResponse;
use Modules\Brand\Services\BrandFeatures;
use Modules\Chair\Exceptions\ChairHasActiveBookingsException as ChairMaintenanceConflictException;
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
        private readonly BrandFeatures $brandFeatures,
        private readonly ShowChairHandler $showHandler,
        private readonly UpdateChairHandler $updateHandler,
    ) {}

    public function __invoke(ChairRequest $request, string $chair): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $scope = $actor->scopedBranchIds();
        $model = $this->showHandler->handle(new ShowChairQuery($chair, $scope));
        $attributes = $request->validated();
        $force = (bool) ($attributes['force'] ?? false);
        unset($attributes['force']);

        if (! $actor->canAccessBranch($attributes['branch_id'])) {
            return $this->forbidden();
        }
        $this->brandFeatures->ensureBranchManageable($model->branch_id);
        $this->brandFeatures->ensureBranchManageable($attributes['branch_id']);

        try {
            $updated = $this->updateHandler->handle($model, new UpdateChairCommand($attributes, $model->branch_id, $force));
        } catch (ChairMaintenanceConflictException $conflict) {
            return $this->error('CHAIR_HAS_ACTIVE_BOOKINGS', __('dashboard::messages.chair_has_active_bookings'), 409, ['booking_ids' => $conflict->bookingIds]);
        } catch (ChairHasActiveBookingsException) {
            return $this->error('CHAIR_HAS_ACTIVE_BOOKINGS', __('dashboard::messages.chair_has_active_bookings'), 409);
        }

        return $updated === null
            ? $this->forbidden(__('dashboard::messages.barber_other_branch'))
            : $this->updated(ChairResource::make($updated->chair), meta: ['canceled_booking_ids' => $updated->canceledBookingIds]);
    }
}
