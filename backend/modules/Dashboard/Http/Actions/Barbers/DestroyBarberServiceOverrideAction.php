<?php

declare(strict_types=1);

namespace Modules\Dashboard\Http\Actions\Barbers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Modules\Barber\Models\BarberModel;
use Modules\Core\Http\Actions\BaseApiAction;
use Modules\Dashboard\CQRS\Command\DestroyBarberServiceOverrideCommand;
use Modules\Dashboard\Handlers\Barbers\DestroyBarberServiceOverrideHandler;
use Modules\Dashboard\Http\Requests\Business\BarberServiceOverrideScopeRequest;
use Modules\Dashboard\Services\DashboardWriteGuard;
use Modules\Dashboard\Support\DashboardActor;
use Modules\OfferedService\Models\BarberServiceOverrideModel;

final class DestroyBarberServiceOverrideAction extends BaseApiAction
{
    public function __construct(private readonly DestroyBarberServiceOverrideHandler $handler, private readonly DashboardWriteGuard $writeGuard) {}

    public function __invoke(BarberServiceOverrideScopeRequest $request, string $barber, string $service): JsonResponse
    {
        /** @var DashboardActor $actor */
        $actor = $request->attributes->get('dashboard_actor');
        $brandId = (string) $request->validated('brand_id');
        $barberId = (string) BarberModel::query()->findOrFail($barber)->getKey();

        Gate::forUser($actor)->authorize('manage', [BarberServiceOverrideModel::class, $barberId, $brandId]);
        $this->writeGuard->ensureBrandWritable($actor, $brandId);
        $this->handler->handle(new DestroyBarberServiceOverrideCommand($barberId, $service, $brandId));

        return $this->deleted();
    }
}
