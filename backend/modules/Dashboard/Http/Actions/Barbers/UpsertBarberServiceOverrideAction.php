<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Barbers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Barber\Models\BarberModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\UpsertBarberServiceOverrideCommand;
use Modules\Dashboard\Handlers\Barbers\UpsertBarberServiceOverrideHandler;
use Modules\Dashboard\Http\Requests\Business\UpsertBarberServiceOverrideRequest;
use Modules\Dashboard\Services\DashboardWriteGuard;
use Modules\Dashboard\Support\DashboardActor;
use Modules\OfferedService\Http\Resources\Shared\ServiceResource;
use Modules\OfferedService\Models\BarberServiceOverrideModel;

final class UpsertBarberServiceOverrideAction extends BaseApiAction
{
    public function __construct(private readonly UpsertBarberServiceOverrideHandler $handler, private readonly DashboardWriteGuard $writeGuard) {}

    public function __invoke(UpsertBarberServiceOverrideRequest $request, string $barber, string $service): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $input = $request->validated();
        $barberId = (string) BarberModel::query()->findOrFail($barber)->getKey();

        Gate::forUser($actor)->authorize('manage', [BarberServiceOverrideModel::class, $barberId, $input['brand_id']]);

        $this->writeGuard->ensureBrandWritable($actor, $input['brand_id']);

        return $this->updated(ServiceResource::make($this->handler->handle(new UpsertBarberServiceOverrideCommand(
            $barberId,
            $service,
            $input['brand_id'],
            $input['price_amount_minor'] ?? null,
            $input['duration_minutes'] ?? null,
        ))));
    }
}
