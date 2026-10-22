<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Chairs;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\DestroyChairCommand;
use Modules\Dashboard\CQRS\Query\ShowChairQuery;
use Modules\Dashboard\Eloquent\Resolvers\Chairs\ChairHasActiveBookingsException;
use Modules\Dashboard\Handlers\Chairs\DestroyChairHandler;
use Modules\Dashboard\Handlers\Chairs\ShowChairHandler;
use Modules\Dashboard\Support\DashboardActor;

final class DestroyChairAction extends BaseApiAction
{
    public function __construct(
        private readonly ShowChairHandler $showHandler,
        private readonly DestroyChairHandler $destroyHandler,
    ) {}

    public function __invoke(Request $request, string $chair): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $model = $this->showHandler->handle(new ShowChairQuery(
            $chair,
            $actor->scopedBranchIds(),
        ));

        try {
            $this->destroyHandler->handle($model, new DestroyChairCommand($chair));
        } catch (ChairHasActiveBookingsException) {
            return $this->error('CHAIR_HAS_ACTIVE_BOOKINGS', __('dashboard::messages.chair_has_active_bookings'), 409);
        }

        return $this->deleted();
    }
}
