<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Barbers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Barber\Models\BarberModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Query\ListBarberServiceOverridesQuery;
use Modules\Dashboard\Handlers\Barbers\ListBarberServiceOverridesHandler;
use Modules\Dashboard\Http\Requests\Business\BarberServiceOverrideScopeRequest;
use Modules\Dashboard\Support\DashboardActor;
use Modules\OfferedService\Http\Resources\Shared\ServiceResource;
use Modules\OfferedService\Models\BarberServiceOverrideModel;

final class ListBarberServiceOverridesAction extends BaseApiAction
{
    public function __construct(private readonly ListBarberServiceOverridesHandler $handler) {}

    public function __invoke(BarberServiceOverrideScopeRequest $request, string $barber): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $brandId = (string) $request->validated('brand_id');
        $barberId = (string) BarberModel::query()->findOrFail($barber)->getKey();

        Gate::forUser($actor)->authorize('manage', [BarberServiceOverrideModel::class, $barberId, $brandId]);

        return $this->ok(ServiceResource::collection(
            $this->handler->handle(new ListBarberServiceOverridesQuery($barberId, $brandId)),
        ));
    }
}
