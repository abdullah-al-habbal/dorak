<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Chairs;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Brand\Services\BrandFeatures;
use Modules\Chair\Http\Resources\Shared\ChairResource;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\StoreChairCommand;
use Modules\Dashboard\Handlers\Chairs\StoreChairHandler;
use Modules\Dashboard\Http\Requests\Business\ChairRequest;
use Modules\Dashboard\Support\DashboardActor;

final class StoreChairAction extends BaseApiAction
{
    public function __construct(
        private readonly BrandFeatures $brandFeatures, private readonly StoreChairHandler $handler) {}

    public function __invoke(ChairRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $attributes = $request->validated();

        Gate::forUser($actor)->authorize('dashboard.chair.create', $attributes['branch_id']);
        $this->brandFeatures->ensureBranchManageable($attributes['branch_id']);

        $chair = $this->handler->handle(new StoreChairCommand(
            $attributes,
            $attributes['branch_id'],
        ));

        return $chair === null
            ? $this->forbidden(__('dashboard::messages.barber_other_branch'))
            : $this->created(ChairResource::make($chair));
    }
}
