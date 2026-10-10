<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Chairs;

use Illuminate\Http\JsonResponse;
use Modules\Chair\Http\Resources\Shared\ChairResource;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\StoreChairCommand;
use Modules\Dashboard\Handlers\Chairs\StoreChairHandler;
use Modules\Dashboard\Http\Requests\ChairRequest;
use Modules\Dashboard\Support\DashboardActor;

final class StoreChairAction extends BaseApiAction
{
    public function __construct(private readonly StoreChairHandler $handler) {}

    public function __invoke(ChairRequest $request): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $attributes = $request->validated();

        if (! $actor->isPlatformAdmin() && $attributes['branch_id'] !== $actor->branchId) {
            return $this->forbidden();
        }

        $chair = $this->handler->handle(new StoreChairCommand(
            $attributes,
            $actor->isPlatformAdmin() ? null : $actor->branchId,
        ));

        return $chair === null
            ? $this->forbidden('The barber belongs to another branch.')
            : $this->created(ChairResource::make($chair));
    }
}
